// AgentCFO dashboard hub — pure Node.js (no framework).
//
// Serves:
//  - The dashboard UI (server-rendered HTML) at /, /purchases, /savings, etc.
//  - The hub API at /api/v1/* (read history/finances, record purchases).
//
// The browser extension reads financial context and reports purchases here.
// Run: node server/index.js   (PORT env var, defaults to 3000)

const http = require("http");
const { URL } = require("url");

const store = require("./store");
const { mockReview } = require("./mockData");
const { layout } = require("./views/layout");
const pages = require("./views/pages");
const { CLIENT_JS } = require("./clientScript");
const auth = require("./auth");
const authViews = require("./views/auth");
const enrichment = require("./enrichment");

const PORT = process.env.PORT || 3000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function sendJson(res, status, data) {
  const payload = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
    ...CORS_HEADERS,
  });
  res.end(payload);
}

function sendHtml(res, status, html) {
  res.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Length": Buffer.byteLength(html),
  });
  res.end(html);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) { reject(new Error("Body too large")); req.destroy(); }
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch { reject(new Error("Invalid JSON body")); }
    });
    req.on("error", reject);
  });
}

// Parse a urlencoded (HTML form) body into a plain object.
function readForm(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) { reject(new Error("Body too large")); req.destroy(); }
    });
    req.on("end", () => {
      const out = {};
      const params = new URLSearchParams(raw);
      for (const [k, v] of params) out[k] = v;
      resolve(out);
    });
    req.on("error", reject);
  });
}

function redirect(res, location, cookie) {
  const headers = { Location: location };
  if (cookie) headers["Set-Cookie"] = cookie;
  res.writeHead(302, headers);
  res.end();
}

const SCRIPT_TAG = '<script src="/app.js"></script>';

// ── Page routing ──
function renderPage(pathname, user) {
  switch (pathname) {
    case "/":
      return layout({ title: "AgentCFO — Your AI Finance Assistant", pathname, user, extraScript: SCRIPT_TAG,
        body: pages.homePage({ summary: store.getDashboardSummaryForUser(user), purchases: store.getRecentPurchases(), review: mockReview }) });
    case "/purchases":
      return layout({ title: "Purchases — AgentCFO", pathname, user, extraScript: SCRIPT_TAG,
        body: pages.purchasesPage({ purchases: store.getRecentPurchases() }) });
    case "/savings":
      return layout({ title: "Savings — AgentCFO", pathname, user, extraScript: SCRIPT_TAG,
        body: pages.savingsPage({ purchases: store.getRecentPurchases(), summary: store.getDashboardSummaryForUser(user) }) });
    case "/insights":
      return layout({ title: "Financial Health — AgentCFO", pathname, user, extraScript: SCRIPT_TAG,
        body: pages.insightsPage({ health: store.getFinancialHealth() }) });
    case "/alerts":
      return layout({ title: "Alerts — AgentCFO", pathname, user, extraScript: SCRIPT_TAG,
        body: pages.alertsPage({ purchases: store.getRecentPurchases() }) });
    case "/todo":
      return layout({ title: "To Do — AgentCFO", pathname, user, extraScript: SCRIPT_TAG,
        body: pages.todoPage(store.getActions()) });
    case "/review":
      return layout({ title: "Purchase Review — AgentCFO", pathname, user, extraScript: SCRIPT_TAG,
        body: pages.reviewPage({ review: mockReview, activity: store.getAgentActivity() }) });
    case "/settings":
      return layout({ title: "Settings — AgentCFO", pathname, user, extraScript: SCRIPT_TAG,
        body: pages.settingsPage({ user }) });
    default:
      return null;
  }
}

// ── API routing ──
async function handleApi(req, res, pathname) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }

  if (pathname === "/api/v1/health" && req.method === "GET")
    return sendJson(res, 200, { status: "ok", service: "agentcfo-dashboard-hub" });

  if (pathname === "/api/v1/dashboard/summary" && req.method === "GET")
    return sendJson(res, 200, store.getDashboardSummary());

  if (pathname === "/api/v1/financial-health" && req.method === "GET")
    return sendJson(res, 200, store.getFinancialHealth());

  if (pathname === "/api/v1/actions" && req.method === "GET")
    return sendJson(res, 200, store.getActions());

  if (pathname === "/api/v1/audit-log" && req.method === "GET")
    return sendJson(res, 200, store.getAgentActivity());

  if (pathname === "/api/v1/purchases/recent" && req.method === "GET")
    return sendJson(res, 200, store.getRecentPurchases());

  if (pathname === "/api/v1/purchases") {
    if (req.method === "GET") return sendJson(res, 200, store.getRecentPurchases());
    if (req.method === "POST") {
      let body;
      try { body = await readBody(req); }
      catch (e) { return sendJson(res, 400, { error: e.message }); }
      const vendor = body.vendor || body.merchant;
      if (!vendor) return sendJson(res, 400, { error: "vendor (or merchant) is required" });
      const purchase = store.recordPurchase({
        vendor,
        item: body.item,
        priceCents: body.priceCents != null ? body.priceCents : body.amount_cents,
        billing: body.billing,
        status: body.status,
        savingsCents: body.savingsCents,
        date: body.date,
        icon: body.icon,
      });
      return sendJson(res, 201, { success: true, purchase });
    }
  }

  return sendJson(res, 404, { error: "Not found" });
}

// ── Static files ──
function serveClientScript(res) {
  res.writeHead(200, {
    "Content-Type": "application/javascript; charset=utf-8",
    "Content-Length": Buffer.byteLength(CLIENT_JS),
    "Cache-Control": "public, max-age=3600",
  });
  res.end(CLIENT_JS);
}

const PROTECTED_PAGES = ["/", "/purchases", "/savings", "/insights", "/alerts", "/todo", "/review", "/settings"];

// ── Auth + onboarding routes. Returns true if it handled the request. ──
async function handleAuth(req, res, pathname) {
  // GET pages
  if (req.method === "GET" && pathname === "/login") {
    sendHtml(res, 200, authViews.loginPage());
    return true;
  }
  if (req.method === "GET" && pathname === "/signup") {
    sendHtml(res, 200, authViews.signupPage());
    return true;
  }
  if (req.method === "GET" && pathname === "/logout") {
    const { sid } = auth.parseCookies(req);
    auth.destroySession(sid);
    redirect(res, "/login", auth.clearCookie());
    return true;
  }

  // POST signup
  if (req.method === "POST" && pathname === "/signup") {
    const form = await readForm(req);
    try {
      const user = auth.createUser(form);
      const token = auth.createSession(user.email);
      redirect(res, "/onboarding", auth.sessionCookie(token));
    } catch (e) {
      sendHtml(res, 200, authViews.signupPage({ error: e.message, values: form }));
    }
    return true;
  }

  // POST login
  if (req.method === "POST" && pathname === "/login") {
    const form = await readForm(req);
    const user = auth.authenticate(form.email, form.password);
    if (!user) {
      sendHtml(res, 200, authViews.loginPage({ error: "Incorrect email or password." }));
      return true;
    }
    const token = auth.createSession(user.email);
    redirect(res, user.profileComplete ? "/" : "/onboarding", auth.sessionCookie(token));
    return true;
  }

  // Save company-profile edits from Settings (requires a session).
  if (req.method === "POST" && pathname === "/settings/company") {
    const user = auth.userFromRequest(req);
    if (!user) { redirect(res, "/login"); return true; }
    const form = await readForm(req);
    const companyProfile = {};
    for (const c of enrichment.getCompanyCriteria()) companyProfile[c.id] = (form[c.id] || "").trim();
    auth.saveCompanyProfile(user.email, companyProfile);
    redirect(res, "/settings");
    return true;
  }

  // Onboarding (requires a session)
  if (pathname === "/onboarding" || pathname.startsWith("/onboarding/")) {
    const user = auth.userFromRequest(req);
    if (!user) { redirect(res, "/login"); return true; }

    // Entry: show the loading interstitial that kicks off enrichment.
    if (req.method === "GET" && pathname === "/onboarding") {
      sendHtml(res, 200, authViews.enrichLoadingPage({ user }));
      return true;
    }

    // Run Exa + AI enrichment, then show the editable confirmation form.
    if (req.method === "POST" && pathname === "/onboarding/enrich") {
      const result = await enrichment.enrichCompany({ company: user.company, country: user.country, address: user.address });
      auth.setPendingEnrichment(user.email, result);
      sendHtml(res, 200, authViews.enrichConfirmPage({
        user,
        criteria: enrichment.getCompanyCriteria(),
        profile: result.profile,
        found: result.found,
        source: result.source,
        sources: result.sources,
        confidence: result.confidence,
      }));
      return true;
    }

    // Confirm/correct company → save profile → generate context questions.
    // "reject" wipes the AI guess and shows a blank form to fill manually.
    if (req.method === "POST" && pathname === "/onboarding/confirm") {
      const form = await readForm(req);
      const criteria = enrichment.getCompanyCriteria();

      if (form.reject) {
        const blank = enrichment.emptyProfile();
        blank.legalName = user.company || "";
        blank.headquarters = user.country || "";
        sendHtml(res, 200, authViews.enrichConfirmPage({
          user, criteria, profile: blank, found: false, source: "manual", sources: [], confidence: 0,
        }));
        return true;
      }

      const companyProfile = {};
      for (const c of criteria) companyProfile[c.id] = (form[c.id] || "").trim();
      auth.saveCompanyProfile(user.email, companyProfile);

      const { questions, source } = await enrichment.generateContextQuestions(companyProfile);
      auth.setPendingEnrichment(user.email, { ...(auth.getPendingEnrichment(user.email) || {}), companyProfile, contextQuestions: questions, contextSource: source });
      sendHtml(res, 200, authViews.contextQuestionsPage({ user, questions, source }));
      return true;
    }

    // Context answers → finish → dashboard.
    if (req.method === "POST" && pathname === "/onboarding/context") {
      const form = await readForm(req);
      const pending = auth.getPendingEnrichment(user.email) || {};
      const contextAnswers = [];
      const count = parseInt(form.ctx_count || "0", 10);
      for (let i = 0; i < count; i++) {
        const q = form[`ctx_q_${i}`];
        const a = form[`ctx_${i}`];
        if (q) contextAnswers.push({ question: q, answer: (a || "").trim() });
      }
      auth.saveProfile(user.email, {
        contextQuestions: pending.contextQuestions || [],
        contextAnswers,
        completedAt: new Date().toISOString(),
      });
      redirect(res, "/");
      return true;
    }
  }

  return false;
}

async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  try {
    if (pathname.startsWith("/api/")) return await handleApi(req, res, pathname);

    // Client script served from memory (public).
    if (req.method === "GET" && pathname === "/app.js") return serveClientScript(res);

    // Auth + onboarding routes (login, signup, logout, onboarding steps).
    if (await handleAuth(req, res, pathname)) return;

    if (req.method === "GET") {
      const user = auth.userFromRequest(req);

      // Gate the dashboard: signed-out users go to login; signed-in users
      // who haven't finished onboarding go to the wizard.
      if (PROTECTED_PAGES.includes(pathname)) {
        if (!user) return redirect(res, "/login");
        if (!user.profileComplete) return redirect(res, "/onboarding");
      }

      const html = renderPage(pathname, user);
      if (html) return sendHtml(res, 200, html);

      // 404 page
      return sendHtml(res, 404, layout({
        title: "Not found — AgentCFO", pathname, user,
        body: `<div class="py-20 text-center"><h1 class="text-2xl font-bold text-ink">Page not found</h1><p class="mt-2 text-sm text-ink-soft">The page you're looking for doesn't exist.</p><a href="/" class="mt-4 inline-block rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white">Back home</a></div>`,
      }));
    }

    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method not allowed");
  } catch (err) {
    sendJson(res, 500, { error: "Internal server error", detail: err.message });
  }
}

// Only start a listening server when run directly (local/Node hosting).
// On Vercel, the exported handler is used as a serverless function instead.
if (require.main === module) {
  const server = http.createServer(handler);
  server.listen(PORT, () => {
    console.log(`AgentCFO dashboard hub running on http://localhost:${PORT}`);
  });
}

module.exports = handler;
