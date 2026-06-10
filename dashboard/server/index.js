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

const SCRIPT_TAG = '<script src="/app.js"></script>';

// ── Page routing ──
function renderPage(pathname) {
  switch (pathname) {
    case "/":
      return layout({ title: "AgentCFO — Your AI Finance Assistant", pathname, extraScript: SCRIPT_TAG,
        body: pages.homePage({ summary: store.getDashboardSummary(), purchases: store.getRecentPurchases(), review: mockReview }) });
    case "/purchases":
      return layout({ title: "Purchases — AgentCFO", pathname, extraScript: SCRIPT_TAG,
        body: pages.purchasesPage({ purchases: store.getRecentPurchases() }) });
    case "/savings":
      return layout({ title: "Savings — AgentCFO", pathname, extraScript: SCRIPT_TAG,
        body: pages.savingsPage({ purchases: store.getRecentPurchases(), summary: store.getDashboardSummary() }) });
    case "/insights":
      return layout({ title: "Financial Health — AgentCFO", pathname, extraScript: SCRIPT_TAG,
        body: pages.insightsPage({ health: store.getFinancialHealth() }) });
    case "/alerts":
      return layout({ title: "Alerts — AgentCFO", pathname, extraScript: SCRIPT_TAG,
        body: pages.alertsPage({ purchases: store.getRecentPurchases() }) });
    case "/todo":
      return layout({ title: "To Do — AgentCFO", pathname, extraScript: SCRIPT_TAG,
        body: pages.todoPage(store.getActions()) });
    case "/review":
      return layout({ title: "Purchase Review — AgentCFO", pathname, extraScript: SCRIPT_TAG,
        body: pages.reviewPage({ review: mockReview, activity: store.getAgentActivity() }) });
    case "/settings":
      return layout({ title: "Settings — AgentCFO", pathname, extraScript: SCRIPT_TAG,
        body: pages.settingsPage() });
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

async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  try {
    if (pathname.startsWith("/api/")) return await handleApi(req, res, pathname);

    if (req.method === "GET") {
      // Client script served from memory.
      if (pathname === "/app.js") return serveClientScript(res);

      const html = renderPage(pathname);
      if (html) return sendHtml(res, 200, html);

      // 404 page
      return sendHtml(res, 404, layout({
        title: "Not found — AgentCFO", pathname,
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
