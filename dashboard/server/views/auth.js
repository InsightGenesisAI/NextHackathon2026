const { esc } = require("../format");

// Minimal auth shell — centered card, brand styling, Tailwind via CDN.
// `wide` widens the container for the multi-section onboarding form.
function authShell({ title, body, wide = false }) {
  const widthCls = wide ? "max-w-3xl" : "max-w-md";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { theme: { extend: { colors: {
      brand:{50:"#f0faf4",100:"#dcf3e4",200:"#bce7cd",300:"#8fd5ab",400:"#5cbd84",500:"#36a366",600:"#268551",700:"#206a43",800:"#1d5438",900:"#194530"},
      ink:{DEFAULT:"#1f2a37",soft:"#475467",faint:"#98a2b3"}, canvas:"#f6f8f7" },
      boxShadow:{card:"0 1px 2px rgba(16,24,40,0.04), 0 6px 20px rgba(16,24,40,0.06)"},
      fontFamily:{sans:["Inter","system-ui","sans-serif"]} } } };
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>html,body{background:#f6f8f7;color:#1f2a37;font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased;}</style>
</head>
<body class="font-sans">
  <div class="flex min-h-screen items-center justify-center px-4 py-10">
    <div class="w-full ${widthCls}">
      <div class="mb-6 flex items-center justify-center gap-2">
        <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white"><i data-lucide="leaf" class="h-5 w-5"></i></span>
        <span class="text-xl font-bold tracking-tight text-ink">AgentCFO</span>
      </div>
      ${body}
    </div>
  </div>
  <script>if(window.lucide)window.lucide.createIcons();</script>
</body>
</html>`;
}

function field(label, name, type, placeholder = "", value = "") {
  return `<label class="block">
    <span class="text-sm font-medium text-ink">${esc(label)}</span>
    <input name="${name}" type="${type}" placeholder="${esc(placeholder)}" value="${esc(value)}" required
      class="mt-1.5 w-full rounded-xl border border-gray-200 bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand-300 focus:bg-white" />
  </label>`;
}

function loginPage({ error } = {}) {
  const body = `<div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
    <h1 class="text-xl font-bold text-ink">Welcome back</h1>
    <p class="mt-1 text-sm text-ink-soft">Sign in to your AgentCFO account.</p>
    ${error ? `<p class="mt-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">${esc(error)}</p>` : ""}
    <form method="POST" action="/login" class="mt-5 space-y-4">
      ${field("Email", "email", "email", "you@company.com")}
      ${field("Password", "password", "password", "••••••••")}
      <button type="submit" class="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600">Sign in</button>
    </form>
    <p class="mt-4 text-center text-sm text-ink-soft">No account yet? <a href="/signup" class="font-semibold text-brand-600 hover:text-brand-700">Create one</a></p>
  </div>`;
  return authShell({ title: "Sign in — AgentCFO", body });
}

function signupPage({ error, values = {} } = {}) {
  const body = `<div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
    <h1 class="text-xl font-bold text-ink">Create your account</h1>
    <p class="mt-1 text-sm text-ink-soft">We'll look up your company to save you setup time.</p>
    ${error ? `<p class="mt-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">${esc(error)}</p>` : ""}
    <form method="POST" action="/signup" class="mt-5 space-y-4">
      ${field("Your name", "name", "text", "Alex Rivera", values.name || "")}
      ${field("Company name", "company", "text", "Acme Co", values.company || "")}
      ${field("Country", "country", "text", "United States", values.country || "")}
      ${optionalField("Business address", "address", "text", "123 Main St, San Francisco, CA", values.address || "")}
      ${field("Email", "email", "email", "you@company.com", values.email || "")}
      ${field("Password", "password", "password", "At least 6 characters")}
      <button type="submit" class="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600">Create account & look up company</button>
    </form>
    <p class="mt-4 text-center text-sm text-ink-soft">Already have an account? <a href="/login" class="font-semibold text-brand-600 hover:text-brand-700">Sign in</a></p>
  </div>`;
  return authShell({ title: "Sign up — AgentCFO", body });
}

// Make the address field optional on signup (not all businesses have one handy).
function optionalField(label, name, type, placeholder = "", value = "") {
  return `<label class="block">
    <span class="text-sm font-medium text-ink">${esc(label)} <span class="text-ink-faint">(optional)</span></span>
    <input name="${name}" type="${type}" placeholder="${esc(placeholder)}" value="${esc(value)}"
      class="mt-1.5 w-full rounded-xl border border-gray-200 bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand-300 focus:bg-white" />
  </label>`;
}

// Loading interstitial while Exa + AI run (auto-submits to kick off lookup).
function enrichLoadingPage({ user }) {
  const body = `<div class="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-card">
    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><i data-lucide="search" class="h-6 w-6"></i></div>
    <h1 class="mt-4 text-xl font-bold text-ink">Looking up ${esc(user.company || "your company")}…</h1>
    <p class="mt-1 text-sm text-ink-soft">Searching the web and organizing what we find. This takes a few seconds.</p>
    <div class="mt-5 flex justify-center"><span class="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-500"></span></div>
    <form id="go" method="POST" action="/onboarding/enrich"></form>
    <script>setTimeout(function(){document.getElementById('go').submit();}, 400);</script>
    <noscript><div class="mt-4"><form method="POST" action="/onboarding/enrich"><button class="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white">Continue</button></form></div></noscript>
  </div>`;
  return authShell({ title: "Looking up your company — AgentCFO", body });
}

// Confirmation: show the AI-structured company profile, editable, with options
// to confirm, correct fields, or reject ("not my company").
function enrichConfirmPage({ user, criteria, profile, found, source, sources, confidence, error }) {
  const fieldFor = (c) => {
    const val = profile[c.id] || "";
    if (c.type === "textarea") {
      return `<label class="block">
        <span class="text-sm font-medium text-ink">${esc(c.label)}</span>
        <textarea name="${c.id}" rows="2" class="mt-1.5 w-full resize-none rounded-xl border border-gray-200 bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand-300 focus:bg-white">${esc(val)}</textarea>
      </label>`;
    }
    return `<label class="block">
      <span class="text-sm font-medium text-ink">${esc(c.label)}</span>
      <input name="${c.id}" type="text" value="${esc(val)}" class="mt-1.5 w-full rounded-xl border border-gray-200 bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand-300 focus:bg-white" />
    </label>`;
  };

  const sourceLinks = (sources || []).length
    ? `<div class="mt-3 text-xs text-ink-faint"><span class="font-semibold">Sources:</span> ${sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noreferrer" class="underline hover:text-ink-soft">${esc(s.title || s.url)}</a>`).join(" · ")}</div>`
    : "";

  const banner = found
    ? `<div class="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800"><span class="font-semibold">We found a match.</span> Confidence ${Math.round((confidence || 0) * 100)}%. Please review and fix anything that's off.</div>`
    : `<div class="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800"><span class="font-semibold">We couldn't confidently identify your company.</span> Fill in what you can below, or skip ahead to the questions.</div>`;

  const badge = source === "exa+ai"
    ? `<span class="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700"><i data-lucide="sparkles" class="h-3 w-3"></i>Found via Exa + AI</span>`
    : source === "ai"
    ? `<span class="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700"><i data-lucide="sparkles" class="h-3 w-3"></i>AI-structured</span>`
    : `<span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-ink-soft">Manual entry</span>`;

  const body = `<div class="space-y-4">
    <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
      <div class="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-600"><span class="h-2 w-2 rounded-full bg-brand-500"></span>Step 1 of 2 · Confirm your company</div>
      <div class="flex items-center justify-between gap-2"><h1 class="text-xl font-bold text-ink">Is this ${esc(user.company || "your company")}?</h1>${badge}</div>
      <p class="mt-1 text-sm text-ink-soft">Here's what we found. Correct anything that's wrong — your edits are what we'll save.</p>
      <div class="mt-4">${banner}</div>
      ${sourceLinks}
      ${error ? `<p class="mt-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">${esc(error)}</p>` : ""}
    </div>
    <form method="POST" action="/onboarding/confirm" class="space-y-4">
      <section class="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">${criteria.map(fieldFor).join("")}</div>
      </section>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <button type="submit" name="reject" value="1" class="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-gray-50">This isn't my company — start fresh</button>
        <button type="submit" name="confirm" value="1" class="rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600">Looks right — continue</button>
      </div>
    </form>
  </div>`;
  return authShell({ title: "Confirm company — AgentCFO", body, wide: true });
}

// Step 2: AI-generated context questions (driven by hardcoded criteria).
function contextQuestionsPage({ user, questions, source }) {
  const fields = questions.map((q, i) => `<label class="block">
    <span class="text-sm font-medium text-ink">${esc(q)}</span>
    <textarea name="ctx_${i}" rows="2" placeholder="Your answer…" class="mt-1.5 w-full resize-none rounded-xl border border-gray-200 bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand-300 focus:bg-white"></textarea>
    <input type="hidden" name="ctx_q_${i}" value="${esc(q)}" />
  </label>`).join("");

  const badge = source === "ai"
    ? `<span class="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700"><i data-lucide="sparkles" class="h-3 w-3"></i>AI-personalized</span>`
    : `<span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-ink-soft">Tailored questions</span>`;

  const body = `<div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
    <div class="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-600"><span class="h-2 w-2 rounded-full bg-brand-500"></span>Step 2 of 2 · A little more context</div>
    <div class="flex items-center justify-between gap-2"><h1 class="text-xl font-bold text-ink">A few questions about how you spend</h1>${badge}</div>
    <p class="mt-1 text-sm text-ink-soft">These help AgentCFO judge purchases for ${esc(user.company || "your business")}. Optional, but they improve accuracy.</p>
    <form method="POST" action="/onboarding/context" class="mt-5 space-y-4">
      <input type="hidden" name="ctx_count" value="${questions.length}" />
      ${fields}
      <div class="flex gap-3">
        <button type="submit" name="finish" value="1" class="flex-1 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600">Finish setup</button>
        <button type="submit" name="skip" value="1" class="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-gray-50">Skip for now</button>
      </div>
    </form>
  </div>`;
  return authShell({ title: "Set up — AgentCFO", body, wide: true });
}

// Step 1: hardcoded base questions, grouped into sections.
module.exports = {
  loginPage,
  signupPage,
  enrichLoadingPage,
  enrichConfirmPage,
  contextQuestionsPage,
};
