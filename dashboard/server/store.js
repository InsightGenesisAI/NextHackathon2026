// In-memory hub store. Holds purchase history and financial summaries.
// The browser extension reports intercepted purchases here and reads financial
// context back. Process-memory only — swap for a database for production.

const {
  mockSummary,
  mockRecentPurchases,
  mockFinancialHealth,
  mockActions,
  mockAgentActivity,
} = require("./mockData");

const state = {
  purchases: [...mockRecentPurchases],
  financialHealth: { ...mockFinancialHealth },
  actions: mockActions,
  activity: mockAgentActivity,
};

function getRecentPurchases(limit = 20) {
  return [...state.purchases]
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
  state.purchases.unshift(purchase);
  return purchase;
}

function getDashboardSummary() {
  const purchases = state.purchases;
  const activeReviews = purchases.filter(
    (p) => p.status === "review" || p.status === "flagged"
  ).length;
  const potentialSavingsCents = purchases
    .filter((p) => p.status !== "approved")
    .reduce((sum, p) => sum + (p.savingsCents || 0), 0);
  const monthSpendCents = purchases
    .filter((p) => p.status === "approved")
    .reduce((sum, p) => sum + p.priceCents, 0);

  return {
    ...mockSummary,
    activeReviews,
    potentialSavingsCents: potentialSavingsCents || mockSummary.potentialSavingsCents,
    monthSpendCents: monthSpendCents || mockSummary.monthSpendCents,
  };
}

function getFinancialHealth() {
  return state.financialHealth;
}

function getActions() {
  return state.actions;
}

function getAgentActivity() {
  return state.activity;
}

// Personalize the summary with the signed-in user's name/company.
function getDashboardSummaryForUser(user) {
  const base = getDashboardSummary();
  if (!user) return base;
  return {
    ...base,
    greetingName: (user.name || "").split(" ")[0] || base.greetingName,
    company: user.company || "",
  };
}

module.exports = {
  getRecentPurchases,
  recordPurchase,
  getDashboardSummary,
  getDashboardSummaryForUser,
  getFinancialHealth,
  getActions,
  getAgentActivity,
};
