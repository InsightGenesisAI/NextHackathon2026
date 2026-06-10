const P = require("./partials");
const { money, moneyPerMonth, relativeDate, dateLabel, daysUntil, esc } = P;

// ── Home ──
function homePage({ summary, purchases, review, user }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const HEALTH_LABEL = { good: "Good", watch: "Watch", risk: "Risk", none: "—" };
  const connected = summary.stripeConnected;

  const metrics = [
    P.metricCard({ label: "Potential Savings", value: money(summary.potentialSavingsCents), sub: connected ? "Found across your purchases" : "Connect Stripe to see", icon: "piggy-bank", tone: connected ? "good" : "neutral" }),
    P.metricCard({ label: "Active Reviews", value: String(summary.activeReviews), sub: connected ? "Waiting for your okay" : "Connect Stripe to see", icon: "clipboard-check", tone: connected && summary.activeReviews > 0 ? "watch" : connected ? "good" : "neutral" }),
    P.metricCard({ label: "Budget Health", value: HEALTH_LABEL[summary.budgetHealth] || "—", sub: connected ? "Across all budgets" : "Connect Stripe to see", icon: "heart-pulse", tone: connected ? summary.budgetHealth : "neutral" }),
    P.metricCard({ label: "This Month's Spend", value: money(summary.monthSpendCents), sub: connected ? `${summary.monthSpendChangePct > 0 ? "+" : ""}${summary.monthSpendChangePct}% vs last month` : "Connect Stripe to see", icon: "receipt", tone: "neutral" }),
  ].join("");

  const benefits = [
    { icon: "shield-check", title: "Stops overpaying", text: "Finds cheaper options before you buy." },
    { icon: "wallet", title: "Protects your budget", text: "Checks every purchase against your cash." },
    { icon: "building-2", title: "Fits your business", text: "Knows the tools you already pay for." },
  ].map((b) => `<li class="flex items-start gap-3">
    <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-soft"><i data-lucide="${b.icon}" class="h-4 w-4"></i></span>
    <div><p class="text-sm font-semibold text-ink">${b.title}</p><p class="text-xs text-ink-soft">${b.text}</p></div>
  </li>`).join("");

  const explainer = `<div class="overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-b from-brand-50 to-white shadow-card">
    <div class="px-5 pt-5">
      <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white"><i data-lucide="sparkles" class="h-5 w-5"></i></span>
      <h2 class="mt-3 text-base font-semibold text-ink">AgentCFO is your AI Finance Assistant</h2>
      <p class="mt-1 text-sm text-ink-soft">It quietly reviews purchases so you can spend with confidence.</p>
    </div>
    <ul class="mt-4 space-y-3 px-5">${benefits}</ul>
    <div class="p-5"><a href="/insights" class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600">See How It Works<i data-lucide="arrow-right" class="h-4 w-4"></i></a></div>
  </div>`;

  const activityInner = connected
    ? P.cardHeader("Recent activity", "What AgentCFO has reviewed lately.") + `<div class="mt-3">${P.activityTable(purchases)}</div>`
    : P.cardHeader("Recent activity", "Connect Stripe to import your purchases.") + P.emptyState("No data yet", "Once you connect Stripe, your purchases and reviews show up here automatically.", "/");

  const body = `<div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-ink">${esc(greeting)}, ${esc(summary.greetingName)}!</h1>
        <p class="mt-1 max-w-2xl text-sm text-ink-soft">${connected ? "AgentCFO is watching your purchases and helping you make smarter spending decisions." : "Connect Stripe to bring your spending and financial data into AgentCFO."}</p>
      </div>
      <div class="flex items-center gap-2">
        ${connected ? `<span class="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700"><i data-lucide="shield-check" class="h-4 w-4"></i>Protection is ON</span>` : ""}
        <button onclick="window.__openDemo&&window.__openDemo()" class="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-ink/90"><i data-lucide="play-circle" class="h-4 w-4"></i>Demo a review</button>
      </div>
    </div>
    ${connected ? "" : P.connectStripeBanner("/")}
    <section>
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-faint">Today at a glance</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">${metrics}</div>
    </section>
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2">${P.card(activityInner)}</div>
      ${explainer}
    </div>
  </div>
  ${checkoutModal(review)}`;

  return body;
}

// Demo checkout modal (client-driven). Mirrors CheckoutOverlayModal.
function checkoutModal(review) {
  const best = review.alternatives.reduce((b, a) => (a.estSavingsCents > (b ? b.estSavingsCents : -1) ? a : b), review.alternatives[0]);
  return `<div id="demo-modal" class="fixed inset-0 z-50 hidden items-center justify-center p-4">
    <div class="absolute inset-0 bg-ink/30 backdrop-blur-sm" onclick="window.__closeDemo&&window.__closeDemo()"></div>
    <div class="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-pop animate-soft-in">
      <div class="flex items-center gap-3 bg-brand-500 px-5 py-4 text-white">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20"><i data-lucide="leaf" class="h-5 w-5"></i></span>
        <div class="flex-1"><h2 class="text-base font-semibold">Quick purchase review</h2><p class="text-sm text-white/85">AgentCFO found a way your business might save money.</p></div>
        <button onclick="window.__closeDemo&&window.__closeDemo()" class="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/15" aria-label="Close"><i data-lucide="x" class="h-4 w-4"></i></button>
      </div>
      <div class="space-y-4 px-5 py-5">
        <div id="demo-result" class="hidden items-center gap-3 rounded-2xl bg-brand-50 p-4">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white"><i data-lucide="check" class="h-5 w-5"></i></span>
          <p id="demo-result-msg" class="text-sm font-medium text-brand-800"></p>
        </div>
        <div id="demo-form" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-2xl border border-gray-100 bg-canvas p-4"><p class="text-xs font-medium text-ink-faint">Current purchase</p><p class="mt-1 text-sm font-semibold text-ink">${esc(review.item)}</p><p class="text-sm text-ink-soft">${moneyPerMonth(review.currentPriceCents, review.billing)}</p></div>
            ${best ? `<div class="rounded-2xl border border-brand-200 bg-brand-50 p-4"><p class="text-xs font-medium text-brand-700">Better option</p><p class="mt-1 text-sm font-semibold text-ink">${esc(best.name)}</p><p class="text-sm text-brand-700">Save ${money(best.estSavingsCents)}/mo</p></div>` : ""}
          </div>
          <div class="rounded-2xl bg-canvas px-4 py-3"><p class="text-sm text-ink-soft">${esc(review.conciseAnalysis)}</p></div>
          <div>
            <label for="ctx" class="text-sm font-medium text-ink">${esc(review.contextQuestion)}</label>
            <textarea id="ctx" rows="2" placeholder="Why do you need this specific option?" class="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand-300 focus:bg-white"></textarea>
          </div>
          <p id="demo-msg" class="hidden rounded-xl px-3.5 py-2.5 text-sm bg-canvas text-ink-soft"></p>
          <div class="flex gap-3">
            <button onclick="window.__demoCancel&&window.__demoCancel()" class="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-gray-50">Cancel Purchase</button>
            <button onclick="window.__demoContinue&&window.__demoContinue()" class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600">Continue with Justification<i data-lucide="arrow-right" class="h-4 w-4"></i></button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// ── Purchases ──
function purchasesPage({ purchases, user }) {
  const connected = user && user.stripeConnected;
  if (!connected) {
    return P.pageHeader("Purchases", "Everything AgentCFO has reviewed for you.") +
      P.card(P.emptyState("No purchases yet", "Connect Stripe to import your purchase history.", "/purchases"));
  }
  return P.pageHeader("Purchases", "Everything AgentCFO has reviewed for you.") + P.card(P.activityTable(purchases));
}

// ── Savings ──
function savingsPage({ purchases, summary, user }) {
  const connected = user && user.stripeConnected;
  if (!connected) {
    return `<div class="space-y-6">${P.pageHeader("Savings", "Money AgentCFO has helped you keep.")}
      ${P.card(P.emptyState("No savings data yet", "Connect Stripe and AgentCFO will surface savings opportunities here.", "/savings"))}
    </div>`;
  }
  const withSavings = purchases.filter((p) => p.savingsCents > 0);
  const realized = purchases.filter((p) => p.status === "approved").reduce((s, p) => s + p.savingsCents, 0);
  const metrics = [
    P.metricCard({ label: "Potential Savings", value: money(summary.potentialSavingsCents), icon: "piggy-bank", tone: "good" }),
    P.metricCard({ label: "Saved So Far", value: money(realized), icon: "trending-down", tone: "good" }),
    P.metricCard({ label: "Opportunities", value: String(withSavings.length), sub: "Worth a look", icon: "repeat", tone: "watch" }),
  ].join("");
  const list = withSavings.length === 0
    ? `<p class="px-5 py-10 text-center text-sm text-ink-faint">Nothing to save right now — your spending looks efficient.</p>`
    : `<ul class="divide-y divide-gray-50 px-5 py-2">${withSavings.map((p) => `<li class="flex items-center gap-3 py-3.5">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-canvas text-lg">${esc(p.icon || "🧾")}</span>
        <div class="min-w-0 flex-1"><p class="text-sm font-semibold text-ink">${esc(p.item)}</p><p class="text-xs text-ink-faint">${esc(p.vendor)}</p></div>
        ${P.savingsBadge(p.savingsCents, p.status !== "approved")}
      </li>`).join("")}</ul>`;
  return `<div class="space-y-6">${P.pageHeader("Savings", "Money AgentCFO has helped you keep.")}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">${metrics}</div>
    ${P.card(P.cardHeader("Savings opportunities", "Where you could spend less.") + list)}
  </div>`;
}

// ── Insights / Financial health ──
function insightsPage({ health, user }) {
  const connected = user && user.stripeConnected;
  if (!connected) {
    return P.pageHeader("Your Financial Health", "Real-time snapshot of your business.") +
      P.connectStripeBanner("/insights");
  }
  const STATUS = {
    good: { label: "Cash flow looks good", cls: "bg-brand-50 text-brand-700", dot: "bg-brand-500" },
    watch: { label: "Worth watching", cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
    risk: { label: "Needs attention", cls: "bg-rose-50 text-rose-700", dot: "bg-rose-500" },
  };
  const s = STATUS[health.status] || STATUS.good;
  const metric = (icon, label, value) => `<div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
    <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><i data-lucide="${icon}" class="h-5 w-5"></i></span>
    <p class="mt-3 text-sm text-ink-soft">${label}</p><p class="mt-0.5 text-xl font-bold text-ink">${esc(value)}</p>
  </div>`;
  const budgets = health.budgets.map(P.budgetProgress).join("");

  const body = `<div class="space-y-5">
    <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${s.cls}"><span class="h-2 w-2 rounded-full ${s.dot}"></span>${s.label}</span>
          <p class="mt-3 max-w-md text-sm text-ink-soft">${esc(health.explanation)}</p>
        </div>
        ${P.sparkline(health.trend)}
      </div>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      ${metric("wallet", "Cash on Hand", money(health.cashOnHandCents))}
      ${metric("trending-up", "Runway", `${health.runwayMonths} months`)}
      ${metric("flame", "Monthly Burn", money(health.monthlyBurnCents))}
    </div>
    <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
      <h2 class="text-base font-semibold text-ink">Budget overview</h2>
      <p class="mt-0.5 text-sm text-ink-soft">How much of each budget you have used.</p>
      <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">${budgets}</div>
    </div>
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-card lg:col-span-2">
        <div class="flex items-center gap-2"><span class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><i data-lucide="credit-card" class="h-4 w-4"></i></span><h2 class="text-base font-semibold text-ink">Company card</h2></div>
        <dl class="mt-4 grid grid-cols-3 gap-4">
          <div><dt class="text-xs text-ink-faint">Card tier</dt><dd class="mt-1 text-sm font-semibold text-ink">${esc(health.ledger.cardholderTier)}</dd></div>
          <div><dt class="text-xs text-ink-faint">Recent approvals</dt><dd class="mt-1 text-sm font-semibold text-ink">${health.ledger.recentApprovals}</dd></div>
          <div><dt class="text-xs text-ink-faint">Budget left</dt><dd class="mt-1 text-sm font-semibold text-ink">${money(health.ledger.remainingBudgetCents)}</dd></div>
        </dl>
      </div>
      <div class="flex items-center rounded-2xl border border-brand-100 bg-brand-50 p-5"><p class="text-sm font-medium text-brand-800">${esc(health.insight)}</p></div>
    </div>
  </div>`;
  return P.pageHeader("Your Financial Health", "Real-time snapshot of your business.") + body;
}

// ── Alerts ──
function alertsPage({ purchases, user }) {
  const connected = user && user.stripeConnected;
  if (!connected) {
    return P.pageHeader("Alerts", "Purchases that could use a quick look.") +
      P.card(P.emptyState("No alerts yet", "Connect Stripe so AgentCFO can flag purchases that need a look.", "/alerts"));
  }
  const alerts = purchases.filter((p) => p.status !== "approved");
  const body = alerts.length === 0
    ? P.card(`<div class="flex flex-col items-center px-5 py-12 text-center">
        <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><i data-lucide="bell" class="h-6 w-6"></i></span>
        <p class="mt-3 text-sm font-semibold text-ink">You're all caught up</p>
        <p class="mt-1 text-sm text-ink-faint">No purchases need your attention right now.</p>
      </div>`)
    : `<ul class="space-y-3">${alerts.map((p) => `<li class="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-soft">
        <span class="flex h-10 w-10 items-center justify-center rounded-xl ${p.status === "flagged" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}"><i data-lucide="alert-circle" class="h-5 w-5"></i></span>
        <div class="min-w-0 flex-1"><p class="text-sm font-semibold text-ink">${esc(p.item)}</p><p class="text-xs text-ink-faint">${esc(p.vendor)} · ${moneyPerMonth(p.priceCents, p.billing)} · ${relativeDate(p.date)}</p></div>
        <a href="/review" class="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-600">Review<i data-lucide="arrow-right" class="h-4 w-4"></i></a>
      </li>`).join("")}</ul>`;
  return P.pageHeader("Alerts", "Purchases that could use a quick look.") + body;
}

// ── To Do ──
function todoPage({ todos, renewals, recommended, user }) {
  const connected = user && user.stripeConnected;
  if (!connected) {
    return P.pageHeader("What's Next?", "Here's what AgentCFO recommends.") +
      P.card(P.emptyState("Nothing to do yet", "Connect Stripe and AgentCFO will suggest tasks, renewals, and actions.", "/todo"));
  }
  const todoItems = todos.map((t) => `<li data-id="${t.id}" class="todo-item flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-soft transition-opacity">
    <button onclick="window.__toggleTodo&&window.__toggleTodo(this)" aria-label="Toggle done" class="todo-check mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-gray-300 transition-colors hover:border-brand-400">
      <svg viewBox="0 0 12 12" class="h-3 w-3 hidden" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.5 6.5l2.5 2.5 4.5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2"><p class="todo-title text-sm font-semibold text-ink">${esc(t.title)}</p>${P.priorityBadge(t.priority)}</div>
      <p class="mt-0.5 text-sm text-ink-soft">${esc(t.detail)}</p>
      ${t.due ? `<p class="mt-1 text-xs text-ink-faint">Due ${dateLabel(t.due)}</p>` : ""}
    </div>
    <button class="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-gray-50 hover:text-ink" aria-label="Take action"><i data-lucide="arrow-right" class="h-4 w-4"></i></button>
  </li>`).join("");

  const recItems = recommended.map((r) => `<div class="rounded-2xl border border-gray-100 bg-white p-4 shadow-soft">
    <div class="flex items-center justify-between gap-2"><p class="text-sm font-semibold text-ink">${esc(r.title)}</p>${P.priorityBadge(r.priority)}</div>
    <p class="mt-1 text-sm text-ink-soft">${esc(r.detail)}</p>
  </div>`).join("");

  const renewalItems = renewals.map((r) => {
    const days = daysUntil(r.renewsOn); const soon = days <= 7;
    return `<li class="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-soft">
      <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas text-lg">${esc(r.icon || "🔁")}</span>
      <div class="min-w-0 flex-1"><p class="text-sm font-semibold text-ink">${esc(r.name)}</p><p class="text-xs text-ink-faint">${moneyPerMonth(r.priceCents, r.billing)} · renews ${dateLabel(r.renewsOn)}</p></div>
      <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${soon ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-ink-soft"}"><i data-lucide="calendar-clock" class="h-3.5 w-3.5"></i>${days <= 0 ? "Due now" : `${days} days`}</span>
    </li>`;
  }).join("");

  return P.pageHeader("What's Next?", "Here's what AgentCFO recommends.") + `<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <div class="space-y-6 lg:col-span-2">
      <section><h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-faint">To do</h2><ul class="space-y-3">${todoItems}</ul></section>
      <section><h2 class="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-faint"><i data-lucide="sparkles" class="h-4 w-4"></i>Recommended actions</h2><div class="grid grid-cols-1 gap-3 sm:grid-cols-2">${recItems}</div></section>
    </div>
    <div>${P.card(P.cardHeader("Coming up", "Renewals in the next few weeks.") + `<div class="px-5 pb-5 pt-3"><ul class="space-y-3">${renewalItems}</ul></div>`)}</div>
  </div>`;
}

// ── Review ──
function reviewPage({ review, activity }) {
  const best = review.alternatives.reduce((m, a) => Math.max(m, a.estSavingsCents), review.estSavingsCents);
  const alts = review.alternatives.map((alt) => `<div class="rounded-2xl border bg-white p-5 shadow-soft transition-shadow hover:shadow-card ${alt.badge ? "border-brand-200" : "border-gray-100"}">
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="flex items-center gap-2"><h3 class="text-base font-semibold text-ink">${esc(alt.name)}</h3>${alt.badge ? `<span class="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700"><i data-lucide="star" class="h-3 w-3"></i>${esc(alt.badge)}</span>` : ""}</div>
        <p class="mt-0.5 text-sm text-ink-soft">${moneyPerMonth(alt.priceCents, alt.billing)}</p>
      </div>
      ${alt.estSavingsCents > 0 ? `<div class="text-right"><p class="text-xs text-ink-faint">You could save</p><p class="text-lg font-bold text-brand-600">${money(alt.estSavingsCents)}</p></div>` : ""}
    </div>
    <p class="mt-3 text-sm text-ink-soft">${esc(alt.reason)}</p>
    <ul class="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">${alt.features.map((f) => `<li class="flex items-center gap-1.5 text-xs text-ink-soft"><i data-lucide="check" class="h-3.5 w-3.5 text-brand-500"></i>${esc(f)}</li>`).join("")}</ul>
    <a href="${esc(alt.url || "#")}" ${alt.url ? 'target="_blank" rel="noreferrer"' : ""} class="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100">View Option<i data-lucide="arrow-up-right" class="h-4 w-4"></i></a>
  </div>`).join("");

  const STEP_ICON = {
    done: `<span class="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white"><i data-lucide="check" class="h-3.5 w-3.5"></i></span>`,
    running: `<span class="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-600"><i data-lucide="loader" class="h-3.5 w-3.5"></i></span>`,
    failed: `<span class="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-600"><i data-lucide="x" class="h-3.5 w-3.5"></i></span>`,
    pending: `<span class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-ink-faint"><i data-lucide="circle" class="h-2.5 w-2.5"></i></span>`,
  };
  const steps = activity.steps.map((s, i) => `<li class="flex gap-3">
    <div class="flex flex-col items-center">${STEP_ICON[s.status] || STEP_ICON.pending}${i < activity.steps.length - 1 ? `<span class="my-1 w-px flex-1 bg-gray-100"></span>` : ""}</div>
    <div class="flex-1 pb-3"><div class="flex items-center justify-between gap-2"><p class="text-sm font-semibold text-ink"><span class="text-brand-600">${esc(s.actor)}</span> · ${esc(s.label)}</p>${typeof s.ms === "number" ? `<span class="shrink-0 text-xs text-ink-faint">${s.ms}ms</span>` : ""}</div>${s.result ? `<p class="mt-0.5 text-sm text-ink-soft">${esc(s.result)}</p>` : ""}</div>
  </li>`).join("");

  const auditEntries = activity.auditLog.map((e, i) => `<li class="flex gap-3 rounded-xl bg-canvas p-3"><span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">${i + 1}</span><p class="text-sm text-ink">${esc(e.step)}</p></li>`).join("");

  const action = `<button onclick="window.__openAudit&&window.__openAudit()" class="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-ink-soft hover:bg-gray-50"><i data-lucide="list-checks" class="h-4 w-4"></i>View audit log</button>`;

  const reviewCard = `<div class="space-y-5">
    <div class="rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
      <div class="flex items-start gap-3">
        <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-600 shadow-soft"><i data-lucide="alert-circle" class="h-5 w-5"></i></span>
        <div class="flex-1"><p class="text-xs font-semibold uppercase tracking-wide text-amber-700">Worth reviewing</p><h3 class="mt-0.5 text-base font-semibold text-ink">${esc(review.item)}</h3><p class="text-sm text-ink-soft">${esc(review.vendor)} · ${moneyPerMonth(review.currentPriceCents, review.billing)}</p><p class="mt-2 text-sm text-ink">${esc(review.flagReason)}</p></div>
      </div>
    </div>
    <div><h3 class="mb-3 text-sm font-semibold text-ink">Better options we found</h3><div class="space-y-3">${alts}</div></div>
    <div class="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-brand-500 px-5 py-4 text-white">
      <p class="text-sm">Original: <span class="font-semibold">${esc(review.item)}</span> at ${moneyPerMonth(review.currentPriceCents, review.billing)}</p>
      <p class="text-sm font-semibold">You could save up to ${money(best)}/mo</p>
    </div>
    <div id="review-actions" class="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
      <label for="why" class="text-sm font-medium text-ink">${esc(review.contextQuestion)}</label>
      <textarea id="why" rows="3" placeholder="Why do you need this specific option?" class="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-canvas px-3.5 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand-300 focus:bg-white"></textarea>
      <p id="review-msg" class="mt-3 hidden rounded-xl px-3.5 py-2.5 text-sm bg-canvas text-ink-soft"></p>
      <div class="mt-4 flex flex-wrap gap-3">
        <button onclick="window.__reviewResolve&&window.__reviewResolve('decline')" class="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-gray-50"><i data-lucide="x" class="h-4 w-4"></i>Cancel Purchase</button>
        <button onclick="window.__reviewResolve&&window.__reviewResolve('submit')" class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 sm:flex-none"><i data-lucide="file-text" class="h-4 w-4"></i>Submit Justification</button>
        <button onclick="window.__reviewResolve&&window.__reviewResolve('continue')" class="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-gray-50">Continue Anyway</button>
      </div>
    </div>
  </div>`;

  const timeline = P.card(`<div class="px-5 py-4"><h2 class="text-base font-semibold text-ink">How AgentCFO decided</h2><p class="text-sm text-ink-soft">A quick look at the steps behind this recommendation.</p></div><ol class="space-y-1 px-5 pb-5">${steps}</ol>`);

  const drawer = `<div id="audit-drawer" class="fixed inset-0 z-50 hidden justify-end">
    <div class="absolute inset-0 bg-ink/20" onclick="window.__closeAudit&&window.__closeAudit()"></div>
    <aside class="thin-scroll relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-pop animate-soft-in">
      <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div class="flex items-center gap-2"><span class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><i data-lucide="list-checks" class="h-4 w-4"></i></span><div><h3 class="text-sm font-semibold text-ink">Audit log</h3><p class="text-xs text-ink-faint">What AgentCFO checked, in plain English.</p></div></div>
        <button onclick="window.__closeAudit&&window.__closeAudit()" class="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-gray-50" aria-label="Close audit log"><i data-lucide="x" class="h-4 w-4"></i></button>
      </div>
      <ol class="space-y-3 px-5 py-5">${auditEntries}</ol>
    </aside>
  </div>`;

  return P.pageHeader("Better alternatives found!", "We found similar options that can save your business money.", action) + `<div class="grid grid-cols-1 gap-6 lg:grid-cols-3"><div class="lg:col-span-2">${reviewCard}</div><div class="space-y-6">${timeline}</div></div>${drawer}`;
}

// ── Settings (static + client toggles) ──
function settingsPage({ user } = {}) {
  const row = (icon, title, desc, control = "") => `<div class="flex items-center gap-3 rounded-xl px-1 py-3">
    <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-canvas text-ink-soft"><i data-lucide="${icon}" class="h-5 w-5"></i></span>
    <div class="flex-1"><p class="text-sm font-semibold text-ink">${esc(title)}</p><p class="text-xs text-ink-soft">${esc(desc)}</p></div>${control}
  </div>`;
  const toggle = (id, on) => `<button data-on="${on ? "1" : "0"}" onclick="window.__toggle&&window.__toggle(this)" class="settings-toggle relative h-6 w-11 rounded-full transition-colors ${on ? "bg-brand-500" : "bg-gray-200"}"><span class="toggle-knob absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}"></span></button>`;
  const radio = (label, desc, checked, group) => `<button data-group="${group}" onclick="window.__radio&&window.__radio(this)" class="settings-radio flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${checked ? "border-brand-300 bg-brand-50" : "border-gray-200 hover:bg-gray-50"}">
    <span class="radio-dot mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${checked ? "border-brand-500" : "border-gray-300"}">${checked ? `<span class="h-2.5 w-2.5 rounded-full bg-brand-500"></span>` : ""}</span>
    <div><p class="text-sm font-semibold text-ink">${esc(label)}</p><p class="text-xs text-ink-soft">${esc(desc)}</p></div>
  </button>`;

  // Editable company profile (the criteria schema) + saved context answers.
  let profileCard = "";
  const cp = user && user.companyProfile;
  const companyFields = [
    ["legalName", "Legal / full company name", "text"],
    ["industry", "Industry", "text"],
    ["specialty", "Niche / specialty", "text"],
    ["description", "What the company does", "textarea"],
    ["foundedYear", "Year founded", "text"],
    ["employeeCount", "Approx. number of employees", "text"],
    ["headquarters", "Headquarters (city, country)", "text"],
    ["website", "Website", "text"],
    ["businessModel", "Business model", "text"],
    ["keyProducts", "Key products or services", "textarea"],
  ];
  if (cp) {
    const inputFor = ([id, label, type]) => {
      const v = cp[id] || "";
      if (type === "textarea") {
        return `<label class="block"><span class="text-sm font-medium text-ink">${esc(label)}</span>
          <textarea name="${id}" rows="2" class="mt-1.5 w-full resize-none rounded-xl border border-gray-200 bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-300 focus:bg-white">${esc(v)}</textarea></label>`;
      }
      return `<label class="block"><span class="text-sm font-medium text-ink">${esc(label)}</span>
        <input name="${id}" type="text" value="${esc(v)}" class="mt-1.5 w-full rounded-xl border border-gray-200 bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-300 focus:bg-white" /></label>`;
    };
    const saved = user && user.__companySaved ? `<span class="text-xs font-semibold text-brand-600">Saved ✓</span>` : "";
    profileCard = P.card(P.cardHeader("Company profile", "From your setup — edit anytime if something changed.", saved) +
      `<form method="POST" action="/settings/company" class="px-5 pb-5 pt-3">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">${companyFields.map(inputFor).join("")}</div>
        <div class="mt-4 flex items-center gap-3">
          <button type="submit" class="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">Save changes</button>
          <a href="/onboarding" class="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-ink-soft hover:bg-gray-50">Re-run company lookup</a>
        </div>
      </form>`);
  }

  // Saved context answers (from the AI questions step).
  let contextCard = "";
  const profile = user && user.profile;
  const ctxAnswers = profile && profile.contextAnswers ? profile.contextAnswers.filter((a) => a.answer) : [];
  if (ctxAnswers.length) {
    const rows = ctxAnswers.map((a) =>
      `<div class="rounded-xl bg-canvas px-3.5 py-3"><p class="text-xs font-semibold text-ink-soft">${esc(a.question)}</p><p class="mt-1 text-sm text-ink">${esc(a.answer)}</p></div>`
    ).join("");
    contextCard = P.card(P.cardHeader("Spending context", "Answers AgentCFO uses to tailor purchase reviews.", `<a href="/onboarding" class="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-gray-50">Update</a>`) +
      `<div class="space-y-2 px-5 pb-5 pt-3">${rows}</div>`);
  }

  const companyDesc = user ? `${user.company || "Your company"} · ${user.email}` : "Acme Co · Small business plan";

  // Stripe connection card — connect/disconnect the financial data source.
  const connected = user && user.stripeConnected;
  const stripeCard = P.card(P.cardHeader("Stripe connection", "Where AgentCFO gets your financial data.") +
    `<div class="flex flex-wrap items-center justify-between gap-3 px-5 pb-5 pt-3">
      <div class="flex items-center gap-3">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl ${connected ? "bg-brand-50 text-brand-600" : "bg-gray-50 text-ink-faint"}"><i data-lucide="${connected ? "check-circle" : "link"}" class="h-5 w-5"></i></span>
        <div>
          <p class="text-sm font-semibold text-ink">${connected ? "Connected" : "Not connected"}</p>
          <p class="text-xs text-ink-soft">${connected ? "Your spending, budgets, and health are synced from Stripe." : "Connect Stripe to populate your dashboard."}</p>
        </div>
      </div>
      <form method="POST" action="${connected ? "/disconnect/stripe" : "/connect/stripe"}">
        <input type="hidden" name="return" value="/settings" />
        <button type="submit" class="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${connected ? "border border-gray-200 text-ink-soft hover:bg-gray-50" : "bg-brand-500 text-white hover:bg-brand-600"}">
          <i data-lucide="${connected ? "unlink" : "link"}" class="h-4 w-4"></i>${connected ? "Disconnect" : "Connect Stripe"}
        </button>
      </form>
    </div>`);

  const body = `<div class="space-y-4">
    ${P.card(P.cardHeader("Account", "Your sign-in details.") + `<div class="space-y-1 px-5 pb-5 pt-3">${row("user", user ? user.name : "Account", user ? user.email : "—")}${row("building-2", "Company", companyDesc)}<div class="px-1 pt-2"><a href="/logout" class="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-semibold text-ink-soft hover:bg-gray-50"><i data-lucide="log-out" class="h-4 w-4"></i>Sign out</a></div></div>`)}
    ${stripeCard}
    ${profileCard}
    ${contextCard}
    ${P.card(P.cardHeader("Protection", "Let AgentCFO review purchases as they happen.") + `<div class="space-y-1 px-5 pb-5 pt-3">${row("shield-check", "Purchase protection", "Review checkouts before you buy.", toggle("protection", true))}${row("bell", "Email alerts", "Get notified when something needs a look.", toggle("alerts", true))}</div>`)}
    ${P.card(P.cardHeader("If the review is slow", "What should happen if AgentCFO can't finish in time.") + `<div class="space-y-2 px-5 pb-5 pt-3">${radio("Pause and let me decide", "Hold the checkout until the review finishes or I choose to continue.", true, "risk")}${radio("Let it through, log for follow-up", "Continue checkout and flag the purchase for later review.", false, "risk")}</div>`)}
  </div>`;
  return `<div class="max-w-2xl">${P.pageHeader("Settings", "Tune how AgentCFO works for your business.")}${body}</div>`;
}

// ── Financials ──
function financialsPage({ financials, user }) {
  const connected = user && user.stripeConnected;
  if (!connected) {
    return P.pageHeader("Financials", "Revenue, expenses, and profitability.") +
      P.connectStripeBanner("/financials");
  }
  const f = financials;
  const pct = (n) => `${n > 0 ? "+" : ""}${n}%`;

  const topMetrics = [
    P.metricCard({ label: "Annual Revenue", value: money(f.revenue.totalCents), sub: `${pct(f.revenue.growthYoYPct)} YoY`, icon: "trending-up", tone: "good" }),
    P.metricCard({ label: "Gross Profit", value: money(f.grossProfitCents), sub: `${f.grossMarginPct}% margin`, icon: "wallet", tone: "good" }),
    P.metricCard({ label: "Operating Profit", value: money(f.operatingProfitCents), sub: `${f.operatingMarginPct}% margin`, icon: "bar-chart-3", tone: "good" }),
    P.metricCard({ label: "Net (pre-tax)", value: money(f.netProfitBeforeTaxCents), sub: `${f.netMarginPct}% margin`, icon: "piggy-bank", tone: "good" }),
  ].join("");

  const recurring = [
    P.metricCard({ label: "MRR", value: money(f.mrrCents), sub: "Monthly recurring revenue", icon: "repeat", tone: "neutral" }),
    P.metricCard({ label: "ARR", value: money(f.arrCents), sub: "Annual recurring revenue", icon: "calendar", tone: "neutral" }),
    P.metricCard({ label: "EBITDA", value: money(f.ebitdaCents), sub: "Earnings before ITDA", icon: "activity", tone: "neutral" }),
    P.metricCard({ label: "COGS", value: money(f.cogsCents), sub: "Cost of goods sold", icon: "package", tone: "neutral" }),
  ].join("");

  // Revenue streams as proportion bars
  const revMax = Math.max(...f.revenue.streams.map((s) => s.amountCents), 1);
  const revRows = f.revenue.streams.map((s) => `<div class="py-2">
    <div class="flex items-center justify-between text-sm"><span class="font-medium text-ink">${esc(s.name)}</span><span class="text-ink-soft">${money(s.amountCents)}</span></div>
    <div class="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100"><div class="progress-fill h-full rounded-full bg-brand-500" style="width:${Math.round((s.amountCents / revMax) * 100)}%"></div></div>
  </div>`).join("");

  // Expense categories
  const expMax = Math.max(...f.expenses.categories.map((c) => c.amountCents), 1);
  const expRows = f.expenses.categories.map((c) => `<div class="py-2">
    <div class="flex items-center justify-between text-sm"><span class="font-medium text-ink">${esc(c.name)}</span><span class="text-ink-soft">${money(c.amountCents)}</span></div>
    <div class="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100"><div class="progress-fill h-full rounded-full bg-amber-500" style="width:${Math.round((c.amountCents / expMax) * 100)}%"></div></div>
  </div>`).join("");

  // Monthly P&L mini-table
  const monthsRows = f.monthly.map((m) => {
    const profit = m.revenueCents - m.expensesCents;
    return `<tr class="border-b border-gray-50 last:border-0">
      <td class="px-4 py-2 text-sm font-medium text-ink">${esc(m.month)}</td>
      <td class="px-4 py-2 text-right text-sm text-ink-soft">${money(m.revenueCents)}</td>
      <td class="px-4 py-2 text-right text-sm text-ink-soft">${money(m.expensesCents)}</td>
      <td class="px-4 py-2 text-right text-sm font-semibold ${profit >= 0 ? "text-brand-600" : "text-rose-600"}">${money(profit)}</td>
    </tr>`;
  }).join("");

  const revTrend = f.monthly.map((m) => Math.round(m.revenueCents / 1000));

  const body = `<div class="space-y-6">
    <section>
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-faint">Profitability</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">${topMetrics}</div>
    </section>
    <section>
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-faint">Recurring revenue & costs</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">${recurring}</div>
    </section>
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      ${P.card(P.cardHeader("Revenue streams", `${money(f.revenue.totalCents)} total · ${pct(f.revenue.growthYoYPct)} YoY`) + `<div class="px-5 pb-5 pt-2">${revRows}</div>`)}
      ${P.card(P.cardHeader("Expense breakdown", `${money(f.expenses.totalCents)} total`) + `<div class="px-5 pb-5 pt-2">${expRows}</div>`)}
    </div>
    ${P.card(P.cardHeader("Revenue trend", "Monthly revenue, last 12 months.") + `<div class="px-5 pb-5 pt-3">${P.sparkline(revTrend, "h-20 w-full", "#36a366")}</div>`)}
    ${P.card(P.cardHeader("Monthly P&L", "Revenue, expenses, and profit by month.") + `<div class="overflow-x-auto px-1 pb-3 pt-3"><table class="w-full"><thead><tr class="border-b border-gray-100 text-xs uppercase tracking-wide text-ink-faint"><th class="px-4 py-2 text-left">Month</th><th class="px-4 py-2 text-right">Revenue</th><th class="px-4 py-2 text-right">Expenses</th><th class="px-4 py-2 text-right">Profit</th></tr></thead><tbody>${monthsRows}</tbody></table></div>`)}
  </div>`;
  return P.pageHeader("Financials", "Revenue, expenses, and profitability for the year.") + body;
}

// ── Taxes ──
function taxesPage({ estimate, financials, user }) {
  const connected = user && user.stripeConnected;
  if (!connected) {
    return P.pageHeader("Taxes", "Estimated taxes and ways to improve efficiency.") +
      P.connectStripeBanner("/taxes");
  }
  if (!estimate) {
    return P.pageHeader("Taxes", "Estimated taxes and ways to improve efficiency.") +
      P.card(P.emptyState("No tax estimate yet", "We couldn't build an estimate right now. Try again shortly.", "/taxes"));
  }

  const e = estimate;
  const sourceBadge = e.source.includes("exa")
    ? `<span class="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700"><i data-lucide="sparkles" class="h-3 w-3"></i>Exa + AI estimate</span>`
    : e.source === "ai"
    ? `<span class="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700"><i data-lucide="sparkles" class="h-3 w-3"></i>AI estimate</span>`
    : `<span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-ink-soft">Heuristic estimate</span>`;

  const topMetrics = [
    P.metricCard({ label: "Taxable Income", value: money(e.taxableIncomeCents), sub: `FY ${e.fiscalYear}`, icon: "file-text", tone: "neutral" }),
    P.metricCard({ label: "Estimated Tax", value: money(e.totalTaxCents), sub: e.jurisdictionLabel, icon: "landmark", tone: "watch" }),
    P.metricCard({ label: "Effective Rate", value: `${e.effectiveRatePct}%`, sub: "Blended", icon: "percent", tone: "neutral" }),
    P.metricCard({ label: "After-Tax Income", value: money(e.afterTaxIncomeCents), sub: "Estimated", icon: "piggy-bank", tone: "good" }),
  ].join("");

  const componentRows = (e.components || []).map((c) => `<tr class="border-b border-gray-50 last:border-0">
    <td class="px-4 py-2.5 text-sm font-medium text-ink">${esc(c.name)}</td>
    <td class="px-4 py-2.5 text-right text-sm text-ink-soft">${c.ratePct}%</td>
    <td class="px-4 py-2.5 text-right text-sm font-semibold text-ink">${money(c.estTaxCents)}</td>
  </tr>`).join("");

  const tips = (e.efficiencyTips || []).map((t) => `<div class="rounded-2xl border border-gray-100 bg-white p-4 shadow-soft">
    <div class="flex items-start justify-between gap-3">
      <div><p class="text-sm font-semibold text-ink">${esc(t.title)}</p><p class="mt-1 text-sm text-ink-soft">${esc(t.detail)}</p></div>
      ${t.estAnnualSavingCents > 0 ? `<span class="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">~${money(t.estAnnualSavingCents)}/yr</span>` : ""}
    </div>
  </div>`).join("");

  const itemNotes = (e.itemNotes || []).map((n) => `<li class="flex items-start gap-2 py-2"><i data-lucide="info" class="mt-0.5 h-4 w-4 shrink-0 text-ink-faint"></i><span class="text-sm text-ink-soft"><span class="font-medium text-ink">${esc(n.item)}:</span> ${esc(n.note)}</span></li>`).join("");

  const sourceLinks = (e.sources || []).length
    ? `<div class="mt-3 text-xs text-ink-faint"><span class="font-semibold">Sources:</span> ${e.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noreferrer" class="underline hover:text-ink-soft">${esc(s.title || s.url)}</a>`).join(" · ")}</div>`
    : "";

  const body = `<div class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <p class="text-sm text-ink-soft">Estimated for <span class="font-semibold text-ink">${esc(e.jurisdictionLabel)}</span></p>
      ${sourceBadge}
    </div>

    <div class="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
      <div class="flex items-start gap-2">
        <i data-lucide="alert-triangle" class="mt-0.5 h-4 w-4 shrink-0 text-amber-600"></i>
        <p class="text-xs leading-relaxed text-amber-800">${esc(e.disclaimer)}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">${topMetrics}</div>

    ${P.card(P.cardHeader("Tax breakdown", "Estimated components for the fiscal year.") + `<div class="overflow-x-auto px-1 pb-3 pt-3"><table class="w-full"><thead><tr class="border-b border-gray-100 text-xs uppercase tracking-wide text-ink-faint"><th class="px-4 py-2 text-left">Component</th><th class="px-4 py-2 text-right">Rate</th><th class="px-4 py-2 text-right">Est. tax</th></tr></thead><tbody>${componentRows}</tbody></table></div>` + (sourceLinks ? `<div class="px-5 pb-4">${sourceLinks}</div>` : ""))}

    <section>
      <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-faint"><i data-lucide="sparkles" class="h-4 w-4"></i>Tax efficiency & recommendations</h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">${tips}</div>
    </section>

    ${itemNotes ? P.card(P.cardHeader("How specific items are treated", "Different categories can carry different tax treatment.") + `<ul class="px-5 pb-5 pt-2">${itemNotes}</ul>`) : ""}
  </div>`;
  return P.pageHeader("Taxes", "Estimated taxes and ways to improve efficiency.") + body;
}

module.exports = {
  homePage, purchasesPage, savingsPage, insightsPage,
  alertsPage, todoPage, reviewPage, settingsPage,
  financialsPage, taxesPage,
};
