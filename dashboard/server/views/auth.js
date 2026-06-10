const { esc } = require("../format");

// Shared head: Frutiger Aero / liquid-glass theme matching the dashboard.
const THEME_HEAD = `
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { theme: { extend: { colors: {
      brand:{50:"#eafaf0",100:"#d3f4e0",200:"#ade9c6",300:"#7edaa6",400:"#4ec888",500:"#27ad6a",600:"#1c8d55",700:"#1a7146",800:"#195b3a",900:"#154a31"},
      ink:{DEFAULT:"#16271f",soft:"#3f5a4d",faint:"#7d9488"}, canvas:"#eef9f3" },
      boxShadow:{card:"0 1px 0 rgba(255,255,255,0.7) inset, 0 10px 30px rgba(20,80,50,0.10), 0 2px 8px rgba(20,80,50,0.06)", soft:"0 2px 10px rgba(20,80,50,0.07)", pop:"0 20px 60px rgba(16,60,40,0.22)"},
      fontFamily:{sans:["Inter","system-ui","sans-serif"]} } } };
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    html,body{color:#16271f;font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased;min-height:100%;}
    body{background:
      radial-gradient(1100px 620px at 8% -12%, #c9f6dd 0%, rgba(201,246,221,0) 55%),
      radial-gradient(1000px 720px at 112% 4%, #c4ecfb 0%, rgba(196,236,251,0) 52%),
      radial-gradient(900px 640px at 50% 118%, #defaea 0%, rgba(222,250,234,0) 55%),
      linear-gradient(180deg,#eafaf2 0%,#eef7fb 100%);background-attachment:fixed;}
    .glass{background:linear-gradient(155deg,rgba(255,255,255,0.86),rgba(255,255,255,0.6));backdrop-filter:blur(16px) saturate(150%);-webkit-backdrop-filter:blur(16px) saturate(150%);border:1px solid rgba(255,255,255,0.75);}
    .gel{background-image:linear-gradient(180deg,rgba(255,255,255,0.35),rgba(255,255,255,0) 45%),linear-gradient(180deg,#3ec585,#1c8d55);box-shadow:0 1px 0 rgba(255,255,255,0.45) inset,0 8px 18px rgba(28,141,85,0.28);}
    button,a{transition:transform .14s cubic-bezier(.22,1,.36,1),box-shadow .2s ease;}
    button:active,a:active{transform:translateY(1px) scale(.99);}
    input:focus,textarea:focus,select:focus{outline:none;box-shadow:0 0 0 3px rgba(78,200,136,0.35);}
    @keyframes sheen{0%{transform:translateX(-120%);}60%,100%{transform:translateX(220%);}}
    .glass-sheen{position:relative;overflow:hidden;}
    .glass-sheen::after{content:"";position:absolute;top:0;left:0;height:100%;width:40%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.5),transparent);transform:translateX(-120%);animation:sheen 6s ease-in-out infinite;pointer-events:none;}
    @keyframes floaty{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
    .floaty{animation:floaty 6s ease-in-out infinite;}
  </style>`;

// Minimal auth shell — centered glass card. `wide` widens for onboarding.
function authShell({ title, body, wide = false }) {
  const widthCls = wide ? "max-w-3xl" : "max-w-md";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  ${THEME_HEAD}
</head>
<body class="font-sans">
  <div class="flex min-h-screen items-center justify-center px-4 py-10">
    <div class="w-full ${widthCls}">
      <a href="/" class="mb-6 flex items-center justify-center gap-2">
        <span class="gel glass-sheen flex h-10 w-10 items-center justify-center rounded-xl text-white"><i data-lucide="leaf" class="h-5 w-5"></i></span>
        <span class="text-xl font-bold tracking-tight text-ink">AgentCFO</span>
      </a>
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
      class="mt-1.5 w-full rounded-xl border border-white/70 bg-white/70 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand-300 focus:bg-white" />
  </label>`;
}

function loginPage({ error } = {}) {
  const body = `<div class="glass rounded-2xl p-6 shadow-card">
    <h1 class="text-xl font-bold text-ink">Welcome back</h1>
    <p class="mt-1 text-sm text-ink-soft">Sign in to your AgentCFO account.</p>
    ${error ? `<p class="mt-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">${esc(error)}</p>` : ""}
    <form method="POST" action="/login" class="mt-5 space-y-4">
      ${field("Email", "email", "email", "you@company.com")}
      ${field("Password", "password", "password", "••••••••")}
      <button type="submit" class="gel w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white">Sign in</button>
    </form>
    <p class="mt-4 text-center text-sm text-ink-soft">No account yet? <a href="/signup" class="font-semibold text-brand-600 hover:text-brand-700">Create one</a></p>
  </div>`;
  return authShell({ title: "Sign in — AgentCFO", body });
}

function signupPage({ error, values = {} } = {}) {
  const body = `<div class="glass rounded-2xl p-6 shadow-card">
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
      <button type="submit" class="gel w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white">Create account & look up company</button>
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
      class="mt-1.5 w-full rounded-xl border border-white/70 bg-white/70 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand-300 focus:bg-white" />
  </label>`;
}

// Public landing / starter page — professional, with clear options.
function landingPage() {
  const feature = (icon, title, text) => `<div class="glass rounded-2xl p-5 shadow-card">
    <span class="gel flex h-10 w-10 items-center justify-center rounded-xl text-white"><i data-lucide="${icon}" class="h-5 w-5"></i></span>
    <h3 class="mt-3 text-base font-semibold text-ink">${esc(title)}</h3>
    <p class="mt-1 text-sm text-ink-soft">${esc(text)}</p>
  </div>`;

  const step = (n, title, text) => `<div class="flex items-start gap-3">
    <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">${n}</span>
    <div><p class="text-sm font-semibold text-ink">${esc(title)}</p><p class="text-sm text-ink-soft">${esc(text)}</p></div>
  </div>`;

  const body = `
  <header class="sticky top-0 z-30 border-b border-white/50 bg-white/45 backdrop-blur-xl">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
      <a href="/" class="flex items-center gap-2"><span class="gel glass-sheen flex h-9 w-9 items-center justify-center rounded-xl text-white"><i data-lucide="leaf" class="h-5 w-5"></i></span><span class="text-lg font-bold tracking-tight text-ink">AgentCFO</span></a>
      <nav class="flex items-center gap-2">
        <a href="/extension" class="hidden rounded-xl px-3 py-2 text-sm font-medium text-ink-soft hover:bg-white/60 sm:inline-block">Extension</a>
        <a href="/login" class="rounded-xl px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-white/60">Sign in</a>
        <a href="/signup" class="gel rounded-xl px-4 py-2 text-sm font-semibold text-white">Get started</a>
      </nav>
    </div>
  </header>

  <main class="mx-auto max-w-6xl px-4 sm:px-6">
    <section class="grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
      <div>
        <span class="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/60 px-3 py-1 text-xs font-semibold text-brand-700 backdrop-blur"><i data-lucide="sparkles" class="h-3.5 w-3.5"></i>AI finance copilot for modern businesses</span>
        <h1 class="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">Spend with confidence.<br/><span class="text-brand-600">AgentCFO has your back.</span></h1>
        <p class="mt-4 max-w-xl text-base text-ink-soft">AgentCFO connects to Stripe, watches every purchase, finds cheaper alternatives, tracks your financial health, and surfaces ways to save — including on taxes. A browser extension intercepts risky checkouts before money moves.</p>
        <div class="mt-7 flex flex-wrap gap-3">
          <a href="/signup" class="gel inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white">Create your account<i data-lucide="arrow-right" class="h-4 w-4"></i></a>
          <a href="/login" class="inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/60 px-5 py-3 text-sm font-semibold text-ink-soft backdrop-blur hover:bg-white/80">Sign in</a>
          <a href="/extension" class="inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/60 px-5 py-3 text-sm font-semibold text-ink-soft backdrop-blur hover:bg-white/80"><i data-lucide="puzzle" class="h-4 w-4"></i>Get the extension</a>
        </div>
        <p class="mt-4 text-xs text-ink-faint">No credit card required · Connect Stripe in one click · Cancel anytime</p>
      </div>
      <div class="floaty glass rounded-3xl p-6 shadow-pop">
        <div class="flex items-center justify-between"><p class="text-sm font-semibold text-ink">Financial health</p><span class="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">Live</span></div>
        <div class="mt-4 grid grid-cols-2 gap-3">
          <div class="rounded-2xl border border-white/70 bg-white/70 p-4"><p class="text-xs text-ink-faint">Net revenue</p><p class="mt-1 text-xl font-bold text-ink">$6.0B</p></div>
          <div class="rounded-2xl border border-white/70 bg-white/70 p-4"><p class="text-xs text-ink-faint">Potential savings</p><p class="mt-1 text-xl font-bold text-brand-600">$2.65M/yr</p></div>
        </div>
        <div class="mt-3 rounded-2xl border border-white/70 bg-white/70 p-4">
          <div class="flex items-center justify-between text-sm"><span class="font-medium text-ink">Software & SaaS</span><span class="text-ink-soft">93%</span></div>
          <div class="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-black/5"><div class="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500" style="width:93%"></div></div>
        </div>
        <div class="mt-3 flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50/70 p-3 text-sm text-rose-700"><i data-lucide="shield-alert" class="h-4 w-4"></i>3 purchases flagged for review</div>
      </div>
    </section>

    <section class="pb-6">
      <h2 class="text-center text-sm font-semibold uppercase tracking-wide text-ink-faint">Everything finance, in one calm place</h2>
      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        ${feature("shield-check", "Purchase protection", "The extension intercepts risky checkouts and runs them through an AI audit before money moves.")}
        ${feature("bar-chart-3", "Financials & health", "Revenue, expenses, margins, runway and budgets — pulled straight from Stripe.")}
        ${feature("compass", "Money review", "Holistic, AI-generated ways to save — including tax efficiency you can't see in Stripe alone.")}
        ${feature("piggy-bank", "Smart savings", "Spot duplicate tools, unused seats, and better-priced alternatives automatically.")}
      </div>
    </section>

    <section class="grid gap-6 py-14 lg:grid-cols-2">
      <div class="glass rounded-3xl p-8 shadow-card">
        <h2 class="text-2xl font-bold text-ink">Up and running in minutes</h2>
        <div class="mt-6 space-y-5">
          ${step(1, "Create your account", "Tell us your company — we look it up automatically with AI to pre-fill your profile.")}
          ${step(2, "Connect Stripe", "Your spending, budgets, and financial health flow in instantly.")}
          ${step(3, "Add the extension", "Protect checkouts everywhere. The dashboard detects when protection is live.")}
        </div>
        <a href="/signup" class="gel mt-7 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white">Start free<i data-lucide="arrow-right" class="h-4 w-4"></i></a>
      </div>
      <div class="glass rounded-3xl p-8 shadow-card">
        <span class="gel flex h-11 w-11 items-center justify-center rounded-xl text-white"><i data-lucide="puzzle" class="h-5 w-5"></i></span>
        <h2 class="mt-4 text-2xl font-bold text-ink">The browser extension</h2>
        <p class="mt-2 text-sm text-ink-soft">Runs independently of the dashboard. When a checkout looks risky, it freezes the purchase and runs the same AI audit pipeline — market pricing, budget, and company policy — then asks for a quick justification.</p>
        <ul class="mt-4 space-y-2 text-sm text-ink-soft">
          <li class="flex items-center gap-2"><i data-lucide="check" class="h-4 w-4 text-brand-500"></i>Works on any checkout page</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="h-4 w-4 text-brand-500"></i>Reports decisions back to your dashboard</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="h-4 w-4 text-brand-500"></i>Dashboard shows when protection is active</li>
        </ul>
        <a href="/extension" class="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/60 px-5 py-3 text-sm font-semibold text-ink-soft backdrop-blur hover:bg-white/80">Extension details<i data-lucide="arrow-right" class="h-4 w-4"></i></a>
      </div>
    </section>

    <footer class="border-t border-white/50 py-8 text-center text-xs text-ink-faint">
      <p>AgentCFO · AI finance copilot. Demo build — figures are illustrative.</p>
    </footer>
  </main>`;

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>AgentCFO — AI finance copilot for modern businesses</title>${THEME_HEAD}</head>
<body class="font-sans">${body}<script>if(window.lucide)window.lucide.createIcons();</script></body></html>`;
}

// Extension info / install page.
function extensionPage() {
  const body = `<div class="glass rounded-2xl p-7 shadow-card">
    <a href="/" class="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"><i data-lucide="arrow-left" class="h-4 w-4"></i>Back</a>
    <div class="mt-4 flex items-center gap-3">
      <span class="gel glass-sheen flex h-12 w-12 items-center justify-center rounded-2xl text-white"><i data-lucide="puzzle" class="h-6 w-6"></i></span>
      <div><h1 class="text-xl font-bold text-ink">AgentCFO browser extension</h1><p class="text-sm text-ink-soft">Real-time purchase protection at checkout.</p></div>
    </div>
    <div class="mt-5 rounded-2xl border border-white/70 bg-white/70 p-4">
      <p class="text-sm font-semibold text-ink">Install (developer mode)</p>
      <ol class="mt-2 list-inside list-decimal space-y-1 text-sm text-ink-soft">
        <li>Open <span class="font-mono text-xs">chrome://extensions</span></li>
        <li>Enable <span class="font-semibold">Developer mode</span> (top right)</li>
        <li>Click <span class="font-semibold">Load unpacked</span> and select the <span class="font-mono text-xs">extension/</span> folder</li>
        <li>Pin AgentCFO and you're protected</li>
      </ol>
    </div>
    <p class="mt-4 text-sm text-ink-soft">The extension runs independently — it protects checkouts even if the dashboard isn't open. When it's installed, your dashboard's <span class="font-semibold text-ink">Protection</span> indicator turns green automatically.</p>
    <div class="mt-6 flex gap-3">
      <a href="/signup" class="gel inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white">Create account<i data-lucide="arrow-right" class="h-4 w-4"></i></a>
      <a href="/login" class="inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/60 px-5 py-2.5 text-sm font-semibold text-ink-soft hover:bg-white/80">Sign in</a>
    </div>
  </div>`;
  return authShell({ title: "Browser extension — AgentCFO", body });
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
  landingPage,
  extensionPage,
  enrichLoadingPage,
  enrichConfirmPage,
  contextQuestionsPage,
};
