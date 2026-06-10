const { esc } = require("../format");

// Minimal auth shell — centered card, brand styling, Tailwind via CDN.
function authShell({ title, body }) {
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
    <div class="w-full max-w-md">
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
    <p class="mt-1 text-sm text-ink-soft">Start protecting your business spend in minutes.</p>
    ${error ? `<p class="mt-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">${esc(error)}</p>` : ""}
    <form method="POST" action="/signup" class="mt-5 space-y-4">
      ${field("Your name", "name", "text", "Alex Rivera", values.name || "")}
      ${field("Company name", "company", "text", "Acme Co", values.company || "")}
      ${field("Email", "email", "email", "you@company.com", values.email || "")}
      ${field("Password", "password", "password", "At least 6 characters")}
      <button type="submit" class="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600">Create account</button>
    </form>
    <p class="mt-4 text-center text-sm text-ink-soft">Already have an account? <a href="/login" class="font-semibold text-brand-600 hover:text-brand-700">Sign in</a></p>
  </div>`;
  return authShell({ title: "Sign up — AgentCFO", body });
}

// Step 1: hardcoded base questions.
function onboardingBasePage({ user, questions, error }) {
  const fields = questions.map((q) => {
    if (q.type === "select") {
      const opts = q.options.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join("");
      return `<label class="block">
        <span class="text-sm font-medium text-ink">${esc(q.label)}</span>
        <select name="${q.id}" required class="mt-1.5 w-full rounded-xl border border-gray-200 bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-300 focus:bg-white">
          <option value="" disabled selected>Choose one…</option>${opts}
        </select>
      </label>`;
    }
    return `<label class="block">
      <span class="text-sm font-medium text-ink">${esc(q.label)}</span>
      <input name="${q.id}" type="text" placeholder="${esc(q.placeholder || "")}" class="mt-1.5 w-full rounded-xl border border-gray-200 bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand-300 focus:bg-white" />
    </label>`;
  }).join("");

  const body = `<div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
    <div class="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-600"><span class="h-2 w-2 rounded-full bg-brand-500"></span>Step 1 of 2 · About your business</div>
    <h1 class="text-xl font-bold text-ink">Tell us about ${esc(user.company || "your company")}</h1>
    <p class="mt-1 text-sm text-ink-soft">A few quick questions so AgentCFO can tailor its advice.</p>
    ${error ? `<p class="mt-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">${esc(error)}</p>` : ""}
    <form method="POST" action="/onboarding/basics" class="mt-5 space-y-4">
      ${fields}
      <button type="submit" class="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600">Continue</button>
    </form>
  </div>`;
  return authShell({ title: "Set up — AgentCFO", body });
}

// Step 2: AI-generated follow-up questions.
function onboardingAiPage({ user, questions, source }) {
  const fields = questions.map((q, i) => `<label class="block">
    <span class="text-sm font-medium text-ink">${esc(q)}</span>
    <textarea name="ai_${i}" rows="2" placeholder="Your answer…" class="mt-1.5 w-full resize-none rounded-xl border border-gray-200 bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand-300 focus:bg-white"></textarea>
    <input type="hidden" name="ai_q_${i}" value="${esc(q)}" />
  </label>`).join("");

  const badge = source === "ai"
    ? `<span class="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700"><i data-lucide="sparkles" class="h-3 w-3"></i>AI-personalized</span>`
    : `<span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-ink-soft">Tailored questions</span>`;

  const body = `<div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
    <div class="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-600"><span class="h-2 w-2 rounded-full bg-brand-500"></span>Step 2 of 2 · A little deeper</div>
    <div class="flex items-center justify-between gap-2">
      <h1 class="text-xl font-bold text-ink">A few tailored questions</h1>${badge}
    </div>
    <p class="mt-1 text-sm text-ink-soft">Based on your answers, these help AgentCFO understand ${esc(user.company || "your business")} better. Optional, but they improve accuracy.</p>
    <form method="POST" action="/onboarding/ai" class="mt-5 space-y-4">
      <input type="hidden" name="ai_count" value="${questions.length}" />
      ${fields}
      <div class="flex gap-3">
        <button type="submit" name="finish" value="1" class="flex-1 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600">Finish setup</button>
        <button type="submit" name="skip" value="1" class="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-gray-50">Skip for now</button>
      </div>
    </form>
  </div>`;
  return authShell({ title: "Set up — AgentCFO", body });
}

module.exports = { loginPage, signupPage, onboardingBasePage, onboardingAiPage };
