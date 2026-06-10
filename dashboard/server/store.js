// Hub store.
//
// Financial data now lives in Stripe (see stripe.js) and is gated per-user:
// the dashboard shows nothing until the user connects Stripe. This module
// exposes per-user getters that delegate to Stripe based on connection state.
//
// Separately, the public /api/v1/* hub (the browser extension's backend) has
// no user session, so it treats the demo Stripe account as connected and can
// also accept extension-reported purchases at runtime.

const stripe = require("./stripe");

// Runtime purchases reported by the extension via POST /api/v1/purchases.
// These augment the demo Stripe data on the public hub only.
const reportedPurchases = [];

// ── Per-user dashboard getters (Stripe-gated) ──
function getRecentPurchasesForUser(user, limit = 20) {
  return stripe
    .getPurchases(user)
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

function getFinancialHealthForUser(user) {
  return stripe.getFinancialHealth(user);
}

function getActionsForUser(user) {
  return stripe.getActions(user);
}

function getDashboardSummaryForUser(user) {
  const base = stripe.getSummaryBase(user);
  const connected = stripe.isConnected(user);

  if (!connected) {
    return {
      ...base,
      greetingName: (user && user.name ? user.name.split(" ")[0] : "") || base.greetingName,
      company: (user && user.company) || "",
      stripeConnected: false,
    };
  }

  const purchases = stripe.getPurchases(user);
  const activeReviews = purchases.filter((p) => p.status === "review" || p.status === "flagged").length;
  const potentialSavingsCents = purchases
    .filter((p) => p.status !== "approved")
    .reduce((sum, p) => sum + (p.savingsCents || 0), 0);
  const monthSpendCents = purchases
    .filter((p) => p.status === "approved")
    .reduce((sum, p) => sum + p.priceCents, 0);

  return {
    ...base,
    activeReviews,
    potentialSavingsCents: potentialSavingsCents || base.potentialSavingsCents,
    monthSpendCents: monthSpendCents || base.monthSpendCents,
    greetingName: (user && user.name ? user.name.split(" ")[0] : "") || base.greetingName,
    company: (user && user.company) || "",
    stripeConnected: true,
  };
}

// ── Public hub (extension backend): demo Stripe account + reported purchases ──
function hubPurchases(limit = 50) {
  const demo = stripe.rawDemo().purchases;
  return [...reportedPurchases, ...demo]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

function recordPurchase(input) {
  const purchase = {
    id: `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    vendor: input.vendor,
    item: input.item || input.vendor,
    priceCents: input.priceCents != null ? input.priceCents : 0,
    billing: input.billing || "monthly",
    status: input.status || "review",
    savingsCents: input.savingsCents != null ? input.savingsCents : 0,
    date: input.date || new Date().toISOString(),
    icon: input.icon,
  };
  reportedPurchases.unshift(purchase);
  return purchase;
}

function hubSummary() {
  const { summary, purchases } = stripe.rawDemo();
  const all = [...reportedPurchases, ...purchases];
  const activeReviews = all.filter((p) => p.status === "review" || p.status === "flagged").length;
  return { ...summary, activeReviews: activeReviews || summary.activeReviews };
}

function hubFinancialHealth() {
  return stripe.rawDemo().financialHealth;
}

function hubActions() {
  return stripe.rawDemo().actions;
}

module.exports = {
  // dashboard (per-user, Stripe-gated)
  getRecentPurchasesForUser,
  getFinancialHealthForUser,
  getActionsForUser,
  getDashboardSummaryForUser,
  // public hub (extension backend)
  hubPurchases,
  recordPurchase,
  hubSummary,
  hubFinancialHealth,
  hubActions,
};
