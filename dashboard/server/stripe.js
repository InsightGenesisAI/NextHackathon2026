// Stripe data source.
//
// In this demo, the financial data "lives in Stripe" rather than locally. Until
// a user connects Stripe, the dashboard shows nothing (empty states / zeros).
// Once connected, these getters return the dummy dataset below — standing in
// for what a real Stripe integration would fetch from the Stripe API.
//
// Connection state is per-user (user.stripeConnected), set via /connect/stripe.

// ── Dummy data that "lives in Stripe" ──
const DEMO_PURCHASES = [
  { id: "p1", vendor: "Slack", item: "Slack Business+", priceCents: 1500, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-09T09:12:00Z", icon: "💬" },
  { id: "p2", vendor: "Notion", item: "Notion Team Plan", priceCents: 2000, billing: "monthly", status: "review", savingsCents: 4800, date: "2026-06-09T08:40:00Z", icon: "📝" },
  { id: "p3", vendor: "Adobe", item: "Adobe Creative Cloud", priceCents: 5999, billing: "monthly", status: "flagged", savingsCents: 12000, date: "2026-06-08T16:05:00Z", icon: "🎨" },
  { id: "p4", vendor: "Semrush", item: "SEMrush Pro", priceCents: 13999, billing: "monthly", status: "flagged", savingsCents: 6000, date: "2026-06-08T11:22:00Z", icon: "📈" },
];

const DEMO_FINANCIAL_HEALTH = {
  status: "good",
  explanation:
    "Your cash flow looks healthy. You have enough runway and your spending is trending down this month.",
  cashOnHandCents: 4900000,
  runwayMonths: 14,
  monthlyBurnCents: 350000,
  trend: [42, 44, 43, 46, 48, 47, 49],
  budgets: [
    { name: "Marketing Budget", allocatedCents: 500000, spentCents: 320000 },
    { name: "Software Budget", allocatedCents: 800000, spentCents: 740000 },
    { name: "Operations Budget", allocatedCents: 600000, spentCents: 215000 },
  ],
  ledger: { cardholderTier: "Team", recentApprovals: 12, remainingBudgetCents: 625000 },
  insight: "Good news! Your recent purchases fit within your current budgets.",
};

const DEMO_ACTIONS = {
  todos: [
    { id: "t1", title: "Review pending purchase approvals", detail: "3 purchases are waiting for your okay.", priority: "high", done: false },
    { id: "t2", title: "Update Q2 marketing budget", detail: "Your marketing spend is 64% used with 5 weeks left.", due: "2026-06-15", priority: "medium", done: false },
    { id: "t3", title: "Check expiring subscriptions", detail: "3 subscriptions renew in the next 30 days.", priority: "medium", done: false },
  ],
  renewals: [
    { id: "r1", name: "Canva Pro", priceCents: 1299, billing: "monthly", renewsOn: "2026-06-18", icon: "🎨" },
    { id: "r2", name: "Google Workspace", priceCents: 1440, billing: "monthly", renewsOn: "2026-06-24", icon: "📧" },
    { id: "r3", name: "Zoom Pro", priceCents: 1499, billing: "monthly", renewsOn: "2026-07-02", icon: "🎥" },
  ],
  recommended: [
    { id: "ra1", title: "Consolidate duplicate licenses", detail: "You have 2 tools that do the same thing.", priority: "high" },
    { id: "ra2", title: "Request manager approval", detail: "One purchase needs a second sign-off.", priority: "medium" },
    { id: "ra3", title: "Run unused subscription audit", detail: "Find seats nobody is using.", priority: "low" },
    { id: "ra4", title: "Negotiate renewal discount", detail: "Two renewals may qualify for annual pricing.", priority: "low" },
  ],
};

const DEMO_SUMMARY = {
  greetingName: "Alex",
  protectionOn: true,
  potentialSavingsCents: 184200,
  activeReviews: 3,
  budgetHealth: "good",
  monthSpendCents: 982400,
  monthSpendChangePct: -8,
};

// ── Empty defaults (shown before Stripe is connected) ──
const EMPTY_FINANCIAL_HEALTH = {
  status: "none",
  explanation: "Connect Stripe to see your cash flow, runway, and budgets.",
  cashOnHandCents: 0,
  runwayMonths: 0,
  monthlyBurnCents: 0,
  trend: [],
  budgets: [],
  ledger: { cardholderTier: "—", recentApprovals: 0, remainingBudgetCents: 0 },
  insight: "",
};

const EMPTY_ACTIONS = { todos: [], renewals: [], recommended: [] };

const EMPTY_SUMMARY = {
  greetingName: "there",
  protectionOn: false,
  potentialSavingsCents: 0,
  activeReviews: 0,
  budgetHealth: "none",
  monthSpendCents: 0,
  monthSpendChangePct: 0,
};

function isConnected(user) {
  return !!(user && user.stripeConnected);
}

function getPurchases(user) {
  return isConnected(user) ? DEMO_PURCHASES.map((p) => ({ ...p })) : [];
}

function getFinancialHealth(user) {
  return isConnected(user) ? { ...DEMO_FINANCIAL_HEALTH } : { ...EMPTY_FINANCIAL_HEALTH };
}

function getActions(user) {
  return isConnected(user) ? DEMO_ACTIONS : EMPTY_ACTIONS;
}

// Base summary numbers (the dashboard recomputes some fields from purchases).
function getSummaryBase(user) {
  return isConnected(user) ? { ...DEMO_SUMMARY } : { ...EMPTY_SUMMARY };
}

// Raw demo data for the public hub API (the extension's backend), which has no
// per-user session — treat it as the connected Stripe account.
function rawDemo() {
  return {
    purchases: DEMO_PURCHASES.map((p) => ({ ...p })),
    financialHealth: { ...DEMO_FINANCIAL_HEALTH },
    actions: DEMO_ACTIONS,
    summary: { ...DEMO_SUMMARY },
  };
}

module.exports = {
  isConnected,
  getPurchases,
  getFinancialHealth,
  getActions,
  getSummaryBase,
  rawDemo,
};
