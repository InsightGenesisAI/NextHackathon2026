const { money, moneyPerMonth, relativeDate, dateLabel, daysUntil, esc } = require("../format");

function card(inner, className = "") {
  return `<div class="rounded-2xl border border-gray-100 bg-white shadow-card ${className}">${inner}</div>`;
}

function cardHeader(title, subtitle, action = "") {
  return `<div class="flex items-start justify-between gap-3 px-5 pt-5">
    <div>
      <h2 class="text-base font-semibold text-ink">${esc(title)}</h2>
      ${subtitle ? `<p class="mt-0.5 text-sm text-ink-soft">${esc(subtitle)}</p>` : ""}
    </div>${action}
  </div>`;
}

function pageHeader(title, subtitle, action = "") {
  return `<div class="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-ink">${esc(title)}</h1>
      ${subtitle ? `<p class="mt-1 max-w-2xl text-sm text-ink-soft">${esc(subtitle)}</p>` : ""}
    </div>${action}
  </div>`;
}

// Prominent banner prompting the user to connect Stripe. `returnTo` is where to
// send them back to after connecting.
function connectStripeBanner(returnTo = "/") {
  return `<div class="overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6 shadow-card">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-start gap-3">
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white"><i data-lucide="link" class="h-5 w-5"></i></span>
        <div>
          <h2 class="text-base font-semibold text-ink">Connect Stripe to get started</h2>
          <p class="mt-0.5 max-w-xl text-sm text-ink-soft">Your dashboard is empty until you connect Stripe. Once linked, AgentCFO pulls your spending, budgets, and financial health automatically.</p>
        </div>
      </div>
      <form method="POST" action="/connect/stripe">
        <input type="hidden" name="return" value="${esc(returnTo)}" />
        <button type="submit" class="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"><i data-lucide="link" class="h-4 w-4"></i>Connect Stripe</button>
      </form>
    </div>
  </div>`;
}

// Generic empty state for a card body when Stripe isn't connected.
function emptyState(title, text, returnTo = "/") {
  return `<div class="flex flex-col items-center px-5 py-12 text-center">
    <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-ink-faint"><i data-lucide="database" class="h-6 w-6"></i></span>
    <p class="mt-3 text-sm font-semibold text-ink">${esc(title)}</p>
    <p class="mt-1 max-w-sm text-sm text-ink-faint">${esc(text)}</p>
    <form method="POST" action="/connect/stripe" class="mt-4">
      <input type="hidden" name="return" value="${esc(returnTo)}" />
      <button type="submit" class="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"><i data-lucide="link" class="h-4 w-4"></i>Connect Stripe</button>
    </form>
  </div>`;
}

const METRIC_TONE = {
  good: "bg-brand-50 text-brand-600",
  watch: "bg-amber-50 text-amber-600",
  risk: "bg-rose-50 text-rose-600",
  neutral: "bg-gray-50 text-ink-soft",
};

function metricCard({ label, value, sub, icon, tone = "neutral" }) {
  return `<div class="animate-soft-in rounded-2xl border border-white/70 bg-white p-5 shadow-card">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-ink-soft">${esc(label)}</span>
      <span class="flex h-9 w-9 items-center justify-center rounded-xl ${METRIC_TONE[tone]}"><i data-lucide="${icon}" class="h-5 w-5"></i></span>
    </div>
    <p class="mt-3 text-2xl font-bold tracking-tight text-ink">${esc(value)}</p>
    ${sub ? `<p class="mt-1 text-xs text-ink-faint">${esc(sub)}</p>` : ""}
  </div>`;
}

const STATUS_BADGE = {
  approved: { label: "Approved", cls: "bg-brand-50 text-brand-700" },
  review: { label: "Review", cls: "bg-amber-50 text-amber-700" },
  flagged: { label: "Action needed", cls: "bg-rose-50 text-rose-700" },
};

function statusBadge(status) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.review;
  return `<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}">${s.label}</span>`;
}

function savingsBadge(cents, potential = false) {
  if (cents <= 0) return `<span class="text-sm text-ink-faint">—</span>`;
  return `<span class="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
    <i data-lucide="trending-down" class="h-3.5 w-3.5"></i>${potential ? "Save " : "Saved "}${money(cents)}
  </span>`;
}

const PRIORITY_BADGE = {
  high: { label: "Soon", cls: "bg-rose-50 text-rose-700" },
  medium: { label: "This week", cls: "bg-amber-50 text-amber-700" },
  low: { label: "Whenever", cls: "bg-gray-100 text-ink-soft" },
};

function priorityBadge(priority) {
  const p = PRIORITY_BADGE[priority] || PRIORITY_BADGE.low;
  return `<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${p.cls}">${p.label}</span>`;
}

function activityTable(purchases, opts = {}) {
  const filterable = !!opts.filterable;
  if (!purchases.length) {
    return `<div class="px-5 py-10 text-center">
      <p class="text-sm font-medium text-ink">No purchases yet</p>
      <p class="mt-1 text-sm text-ink-faint">AgentCFO will show activity here as soon as it spots a purchase.</p>
    </div>`;
  }
  const typeOf = (p) => (p.billing === "one-time" ? "one-time" : "subscription");
  const typePill = (p) => p.billing === "one-time"
    ? `<span class="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700"><i data-lucide="package" class="h-3 w-3"></i>One-time</span>`
    : `<span class="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"><i data-lucide="repeat" class="h-3 w-3"></i>Subscription</span>`;
  const attr = filterable ? (p) => ` class="purchase-row border-b border-gray-50/80 last:border-0 transition-colors hover:bg-white/60" data-type="${typeOf(p)}"` : () => ` class="border-b border-gray-50/80 last:border-0 transition-colors hover:bg-white/60"`;

  const rows = purchases.map((p) => `<tr${attr(p)}>
    <td class="px-5 py-3.5">
      <div class="flex items-center gap-3">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white/70 text-lg shadow-soft">${esc(p.icon || "🧾")}</span>
        <div><p class="text-sm font-semibold text-ink">${esc(p.item)}</p><p class="text-xs text-ink-faint">${esc(p.vendor)}</p></div>
      </div>
    </td>
    <td class="px-3 py-3.5 text-sm text-ink-soft">${moneyPerMonth(p.priceCents, p.billing)}</td>
    <td class="px-3 py-3.5">${typePill(p)}</td>
    <td class="px-3 py-3.5">${statusBadge(p.status)}</td>
    <td class="px-3 py-3.5">${savingsBadge(p.savingsCents, p.status !== "approved")}</td>
    <td class="px-3 py-3.5 text-sm text-ink-faint">${relativeDate(p.date)}</td>
    <td class="px-5 py-3.5 text-right">
      <a href="/review?id=${encodeURIComponent(p.id)}" class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-white/70 hover:text-ink" aria-label="View purchase"><i data-lucide="chevron-right" class="h-4 w-4"></i></a>
    </td>
  </tr>`).join("");

  const mobile = purchases.map((p) => `<li${filterable ? ` class="purchase-row flex items-center gap-3 px-5 py-4" data-type="${typeOf(p)}"` : ` class="flex items-center gap-3 px-5 py-4"`}>
    <span class="flex h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/70 text-lg shadow-soft">${esc(p.icon || "🧾")}</span>
    <div class="min-w-0 flex-1"><p class="truncate text-sm font-semibold text-ink">${esc(p.item)}</p><p class="text-xs text-ink-faint">${moneyPerMonth(p.priceCents, p.billing)} · ${relativeDate(p.date)}</p></div>
    ${statusBadge(p.status)}
  </li>`).join("");

  return `<div class="overflow-hidden">
    <table class="hidden w-full sm:table">
      <thead><tr class="border-b border-gray-100/80 text-left text-xs font-medium uppercase tracking-wide text-ink-faint">
        <th class="px-5 py-3">Purchase</th><th class="px-3 py-3">Price</th><th class="px-3 py-3">Type</th><th class="px-3 py-3">Status</th><th class="px-3 py-3">Savings</th><th class="px-3 py-3">Date</th><th class="px-5 py-3"></th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <ul class="divide-y divide-gray-50/80 sm:hidden">${mobile}</ul>
    <p id="purchases-empty" class="hidden px-5 py-10 text-center text-sm text-ink-faint">No purchases of this type.</p>
  </div>`;
}

function sparkline(data, className = "h-16 w-48", stroke = "#36a366") {
  if (!data || data.length < 2) return "";
  const w = 240, h = 64, pad = 4;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1);
  const points = data.map((v, i) => [pad + i * step, h - pad - ((v - min) / range) * (h - pad * 2)]);
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = points[points.length - 1];
  const area = `${line} L${last[0].toFixed(1)},${h - pad} L${pad},${h - pad} Z`;
  return `<svg viewBox="0 0 ${w} ${h}" class="${className}" preserveAspectRatio="none">
    <defs><linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${stroke}" stop-opacity="0.18"/><stop offset="100%" stop-color="${stroke}" stop-opacity="0"/></linearGradient></defs>
    <path d="${area}" fill="url(#spark-fill)"/>
    <path d="${line}" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function budgetProgress(b) {
  const pct = b.allocatedCents ? Math.min(100, Math.round((b.spentCents / b.allocatedCents) * 100)) : 0;
  const tone = pct >= 95 ? { bar: "from-rose-400 to-rose-500", text: "text-rose-600" } : pct >= 80 ? { bar: "from-amber-400 to-amber-500", text: "text-amber-600" } : { bar: "from-brand-400 to-brand-500", text: "text-brand-600" };
  return `<div class="rounded-xl border border-white/70 bg-white/70 p-4 backdrop-blur">
    <div class="flex items-center justify-between"><span class="text-sm font-semibold text-ink">${esc(b.name)}</span><span class="text-sm font-semibold ${tone.text}">${pct}%</span></div>
    <div class="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-black/5 shadow-inner"><div class="progress-fill h-full rounded-full bg-gradient-to-r ${tone.bar}" style="width:${pct}%;box-shadow:0 1px 0 rgba(255,255,255,.5) inset"></div></div>
    <p class="mt-2 text-xs text-ink-faint">${money(b.spentCents)} of ${money(b.allocatedCents)} used</p>
  </div>`;
}

module.exports = {
  card, cardHeader, pageHeader, connectStripeBanner, emptyState, metricCard, statusBadge, savingsBadge,
  priorityBadge, activityTable, sparkline, budgetProgress,
  money, moneyPerMonth, relativeDate, dateLabel, daysUntil, esc,
};
