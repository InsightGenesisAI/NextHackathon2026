// Stripe data source.
//
// In this demo, the financial data "lives in Stripe" rather than locally. Until
// a user connects Stripe, the dashboard shows nothing (empty states / zeros).
// Once connected, these getters return the extensive dummy dataset below —
// standing in for what a real Stripe integration would fetch from the API.
//
// The dataset models one fictional company end-to-end so the whole dashboard
// (purchases, savings, financial health, budgets, alerts, to-dos, renewals)
// tells a coherent story for demos.
//
// Connection state is per-user (user.stripeConnected), set via /connect/stripe.

// ── The demo company (everything below belongs to this one account) ──
const DEMO_COMPANY = {
  name: "Northwind Labs",
  greetingName: "Alex",
  entityType: "C-Corporation",
  city: "San Francisco",
  state: "California",
  country: "United States",
  location: "San Francisco, California, United States",
  headcount: 52,
};

// ── Purchases (24 entries across vendors, statuses, and dates) ──
// status: "approved" (cleared), "review" (awaiting okay), "flagged" (needs action)
const DEMO_PURCHASES = [
  { id: "p01", vendor: "Amazon Web Services", item: "AWS — Compute & Storage", priceCents: 412300, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-10T07:45:00Z", icon: "☁️" },
  { id: "p02", vendor: "Slack", item: "Slack Business+ (42 seats)", priceCents: 63000, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-10T06:12:00Z", icon: "💬" },
  { id: "p03", vendor: "Adobe", item: "Adobe Creative Cloud — All Apps (8 seats)", priceCents: 47992, billing: "monthly", status: "flagged", savingsCents: 24000, date: "2026-06-09T16:05:00Z", icon: "🎨" },
  { id: "p04", vendor: "Notion", item: "Notion Business (50 seats)", priceCents: 75000, billing: "monthly", status: "review", savingsCents: 18000, date: "2026-06-09T14:40:00Z", icon: "📝" },
  { id: "p05", vendor: "Semrush", item: "SEMrush Guru", priceCents: 24999, billing: "monthly", status: "flagged", savingsCents: 12000, date: "2026-06-09T11:22:00Z", icon: "📈" },
  { id: "p06", vendor: "HubSpot", item: "HubSpot Marketing Pro", priceCents: 89000, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-08T15:30:00Z", icon: "🧲" },
  { id: "p07", vendor: "Figma", item: "Figma Organization (15 seats)", priceCents: 67500, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-08T10:05:00Z", icon: "🖌️" },
  { id: "p08", vendor: "Datadog", item: "Datadog Pro — Monitoring", priceCents: 138000, billing: "monthly", status: "review", savingsCents: 31000, date: "2026-06-07T19:18:00Z", icon: "🐶" },
  { id: "p09", vendor: "Zoom", item: "Zoom Business (30 hosts)", priceCents: 59970, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-07T13:02:00Z", icon: "🎥" },
  { id: "p10", vendor: "Salesforce", item: "Sales Cloud Enterprise (12 seats)", priceCents: 198000, billing: "monthly", status: "flagged", savingsCents: 54000, date: "2026-06-06T17:44:00Z", icon: "☁️" },
  { id: "p11", vendor: "GitHub", item: "GitHub Enterprise (40 seats)", priceCents: 84000, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-06T09:15:00Z", icon: "🐙" },
  { id: "p12", vendor: "Atlassian", item: "Jira + Confluence (45 seats)", priceCents: 71000, billing: "monthly", status: "review", savingsCents: 9000, date: "2026-06-05T12:33:00Z", icon: "🧩" },
  { id: "p13", vendor: "Mailchimp", item: "Mailchimp Standard", priceCents: 35000, billing: "monthly", status: "flagged", savingsCents: 21000, date: "2026-06-05T08:50:00Z", icon: "🐵" },
  { id: "p14", vendor: "Google Workspace", item: "Google Workspace Business Plus (50 seats)", priceCents: 90000, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-04T16:20:00Z", icon: "📧" },
  { id: "p15", vendor: "Canva", item: "Canva Teams (10 seats)", priceCents: 10000, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-04T11:11:00Z", icon: "🎨" },
  { id: "p16", vendor: "Linear", item: "Linear Business (38 seats)", priceCents: 53200, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-03T14:05:00Z", icon: "📐" },
  { id: "p17", vendor: "Intercom", item: "Intercom Advanced", priceCents: 119900, billing: "monthly", status: "flagged", savingsCents: 42000, date: "2026-06-03T10:40:00Z", icon: "💬" },
  { id: "p18", vendor: "Vercel", item: "Vercel Pro (team)", priceCents: 20000, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-02T18:25:00Z", icon: "▲" },
  { id: "p19", vendor: "Snowflake", item: "Snowflake — Data Warehouse", priceCents: 264000, billing: "monthly", status: "review", savingsCents: 60000, date: "2026-06-02T09:48:00Z", icon: "❄️" },
  { id: "p20", vendor: "1Password", item: "1Password Business (50 seats)", priceCents: 39950, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-01T13:30:00Z", icon: "🔐" },
  { id: "p21", vendor: "Dropbox", item: "Dropbox Business Advanced", priceCents: 60000, billing: "monthly", status: "flagged", savingsCents: 36000, date: "2026-05-31T15:12:00Z", icon: "📦" },
  { id: "p22", vendor: "Calendly", item: "Calendly Teams (20 seats)", priceCents: 32000, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-05-30T10:00:00Z", icon: "📅" },
  { id: "p23", vendor: "Webflow", item: "Webflow Site Plan (annual)", priceCents: 276000, billing: "annual", status: "review", savingsCents: 40000, date: "2026-05-29T12:00:00Z", icon: "🌊" },
  { id: "p24", vendor: "Loom", item: "Loom Business (25 seats)", priceCents: 37500, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-05-28T09:20:00Z", icon: "🎬" },
];

// ── Financial health (rich cash-flow + budget picture) ──
const DEMO_FINANCIAL_HEALTH = {
  status: "watch",
  explanation:
    "Cash flow is solid, but software spend has crept up 11% this quarter. A few subscriptions are over-provisioned — trimming them would extend your runway by roughly two months.",
  cashOnHandCents: 18750000, // $187,500
  runwayMonths: 11,
  monthlyBurnCents: 1685000, // $16,850
  trend: [162, 168, 171, 169, 176, 182, 179, 188, 184, 191, 187, 169],
  budgets: [
    { name: "Engineering & Infra", allocatedCents: 1200000, spentCents: 1086300 },
    { name: "Software & SaaS", allocatedCents: 900000, spentCents: 861500 },
    { name: "Marketing", allocatedCents: 700000, spentCents: 459000 },
    { name: "Sales & CRM", allocatedCents: 500000, spentCents: 480000 },
    { name: "Operations", allocatedCents: 400000, spentCents: 168000 },
    { name: "Design & Creative", allocatedCents: 250000, spentCents: 175492 },
  ],
  ledger: { cardholderTier: "Scale", recentApprovals: 47, remainingBudgetCents: 1019708 },
  insight:
    "Heads up: 4 purchases are flagged and 4 are awaiting review. Acting on the flagged ones could save about $2,190/mo.",
};

// ── Comprehensive financials (annual cycle, "from Stripe") ──
// All cents. Figures model a ~$2.16M ARR SaaS company so the dashboard and tax
// estimates have a coherent, realistic picture to work from.
const DEMO_FINANCIALS = {
  fiscalYear: 2026,
  currency: "USD",

  // Recurring revenue snapshot
  mrrCents: 18000000, // $180,000 MRR
  arrCents: 216000000, // $2.16M ARR

  // Revenue streams (annual)
  revenue: {
    totalCents: 224800000, // $2,248,000
    streams: [
      { name: "Subscriptions (SaaS)", amountCents: 198000000 },
      { name: "Professional services", amountCents: 16800000 },
      { name: "Marketplace / add-ons", amountCents: 7400000 },
      { name: "Interest & other income", amountCents: 2600000 },
    ],
    growthYoYPct: 34,
  },

  // Expenses (annual), grouped
  expenses: {
    totalCents: 178550000, // $1,785,500
    categories: [
      { name: "Payroll & benefits", amountCents: 112000000, taxCategory: "payroll" },
      { name: "Cloud & infrastructure", amountCents: 21600000, taxCategory: "software" },
      { name: "Software & SaaS tools", amountCents: 14400000, taxCategory: "software" },
      { name: "Marketing & advertising", amountCents: 12800000, taxCategory: "marketing" },
      { name: "Office & rent", amountCents: 8400000, taxCategory: "rent" },
      { name: "Professional services (legal/acct)", amountCents: 4200000, taxCategory: "services" },
      { name: "Travel & entertainment", amountCents: 2600000, taxCategory: "travel" },
      { name: "Equipment & hardware", amountCents: 1900000, taxCategory: "equipment" },
      { name: "Other operating", amountCents: 650000, taxCategory: "other" },
    ],
  },

  // Cost of goods sold (annual) — used for gross margin
  cogsCents: 38500000, // $385,000 (hosting, support, payment fees tied to delivery)

  // Derived profitability (annual)
  grossProfitCents: 186300000, // revenue.total - cogs
  grossMarginPct: 82.9,
  operatingExpensesCents: 140050000, // expenses.total - cogs portion already counted
  operatingProfitCents: 46250000, // EBIT, $462,500
  operatingMarginPct: 20.6,
  ebitdaCents: 52900000, // $529,000
  netProfitBeforeTaxCents: 46250000, // $462,500 taxable base (pre-tax)
  netMarginPct: 20.6,

  // Monthly P&L trend (last 12 months, cents) — revenue vs expenses
  monthly: [
    { month: "Jul", revenueCents: 16800000, expensesCents: 13900000 },
    { month: "Aug", revenueCents: 17200000, expensesCents: 14100000 },
    { month: "Sep", revenueCents: 17600000, expensesCents: 14300000 },
    { month: "Oct", revenueCents: 18100000, expensesCents: 14600000 },
    { month: "Nov", revenueCents: 18400000, expensesCents: 14800000 },
    { month: "Dec", revenueCents: 19200000, expensesCents: 15200000 },
    { month: "Jan", revenueCents: 18600000, expensesCents: 14900000 },
    { month: "Feb", revenueCents: 18900000, expensesCents: 15050000 },
    { month: "Mar", revenueCents: 19400000, expensesCents: 15300000 },
    { month: "Apr", revenueCents: 19800000, expensesCents: 15500000 },
    { month: "May", revenueCents: 20100000, expensesCents: 15650000 },
    { month: "Jun", revenueCents: 20700000, expensesCents: 16850000 },
  ],

  // Useful ratios / KPIs
  kpis: {
    burnMultiple: 0.6,
    cacPaybackMonths: 11,
    ltvToCac: 4.2,
    grossChurnPctMonthly: 1.8,
    netRevenueRetentionPct: 114,
  },
};

// ── Tax profile (inputs the tax estimator uses; "from Stripe" + company) ──
const DEMO_TAX_PROFILE = {
  entityType: DEMO_COMPANY.entityType,
  location: DEMO_COMPANY.location,
  country: DEMO_COMPANY.country,
  state: DEMO_COMPANY.state,
  taxableIncomeCents: DEMO_FINANCIALS.netProfitBeforeTaxCents, // $462,500
  fiscalYear: DEMO_FINANCIALS.fiscalYear,
  // Items/categories that may carry different treatment (deductions/credits).
  notableItems: [
    { name: "R&D / engineering payroll", amountCents: 64000000, note: "May qualify for R&D tax credit" },
    { name: "Cloud & software", amountCents: 36000000, note: "Generally fully deductible operating expense" },
    { name: "Equipment & hardware", amountCents: 1900000, note: "May be eligible for Section 179 / bonus depreciation" },
    { name: "Travel & entertainment", amountCents: 2600000, note: "Meals often only 50% deductible" },
    { name: "Marketing & advertising", amountCents: 12800000, note: "Generally fully deductible" },
  ],
};

// ── Actions: to-dos, upcoming renewals, recommendations ──
const DEMO_ACTIONS = {
  todos: [
    { id: "t1", title: "Review 4 flagged purchases", detail: "Adobe, Salesforce, Intercom, and Dropbox look over-provisioned.", priority: "high", done: false },
    { id: "t2", title: "Approve pending Snowflake spend", detail: "$2,640 data-warehouse charge is awaiting your okay.", due: "2026-06-12", priority: "high", done: false },
    { id: "t3", title: "Reclaim unused Adobe seats", detail: "3 of 8 Creative Cloud seats haven't been used in 30 days.", due: "2026-06-15", priority: "medium", done: false },
    { id: "t4", title: "Consolidate Mailchimp into HubSpot", detail: "You're paying for email in two tools.", due: "2026-06-18", priority: "medium", done: false },
    { id: "t5", title: "Renegotiate Salesforce contract", detail: "Renewal is in 24 days — you qualify for annual pricing.", due: "2026-07-04", priority: "medium", done: false },
    { id: "t6", title: "Audit Dropbox vs Google Workspace storage", detail: "Overlapping storage spend of ~$360/mo.", priority: "low", done: false },
    { id: "t7", title: "Set an approval threshold", detail: "Purchases over $1,000 currently auto-clear.", priority: "low", done: false },
  ],
  renewals: [
    { id: "r1", name: "Salesforce Sales Cloud", priceCents: 198000, billing: "monthly", renewsOn: "2026-06-13", icon: "☁️" },
    { id: "r2", name: "Datadog Pro", priceCents: 138000, billing: "monthly", renewsOn: "2026-06-16", icon: "🐶" },
    { id: "r3", name: "Adobe Creative Cloud", priceCents: 47992, billing: "monthly", renewsOn: "2026-06-18", icon: "🎨" },
    { id: "r4", name: "Webflow Site Plan", priceCents: 276000, billing: "annual", renewsOn: "2026-06-22", icon: "🌊" },
    { id: "r5", name: "Google Workspace", priceCents: 90000, billing: "monthly", renewsOn: "2026-06-24", icon: "📧" },
    { id: "r6", name: "HubSpot Marketing Pro", priceCents: 89000, billing: "monthly", renewsOn: "2026-06-28", icon: "🧲" },
    { id: "r7", name: "Snowflake", priceCents: 264000, billing: "monthly", renewsOn: "2026-07-01", icon: "❄️" },
    { id: "r8", name: "Zoom Business", priceCents: 59970, billing: "monthly", renewsOn: "2026-07-03", icon: "🎥" },
  ],
  recommended: [
    { id: "ra1", title: "Cut 3 unused Adobe seats", detail: "Drop from 8 to 5 seats — saves $1,800/mo.", priority: "high" },
    { id: "ra2", title: "Right-size Salesforce licenses", detail: "4 inactive seats. Removing them saves $540/mo.", priority: "high" },
    { id: "ra3", title: "Replace Intercom with HubSpot chat", detail: "You already pay for HubSpot — saves $420/mo.", priority: "medium" },
    { id: "ra4", title: "Move Webflow to annual billing", detail: "Already annual — confirm the 18% discount applied.", priority: "low" },
    { id: "ra5", title: "Consolidate email tools", detail: "Mailchimp overlaps HubSpot — saves $210/mo.", priority: "medium" },
    { id: "ra6", title: "Review Snowflake usage tier", detail: "Spend up 32% MoM — check for runaway queries.", priority: "high" },
  ],
};

// ── Top-line summary (dashboard recomputes some fields from purchases) ──
const DEMO_SUMMARY = {
  greetingName: DEMO_COMPANY.greetingName,
  protectionOn: true,
  potentialSavingsCents: 219000, // $2,190 across flagged + review items
  activeReviews: 8,
  budgetHealth: "watch",
  monthSpendCents: 1685000, // $16,850 this month
  monthSpendChangePct: 11,
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

const EMPTY_FINANCIALS = {
  fiscalYear: null,
  currency: "USD",
  mrrCents: 0,
  arrCents: 0,
  revenue: { totalCents: 0, streams: [], growthYoYPct: 0 },
  expenses: { totalCents: 0, categories: [] },
  cogsCents: 0,
  grossProfitCents: 0,
  grossMarginPct: 0,
  operatingExpensesCents: 0,
  operatingProfitCents: 0,
  operatingMarginPct: 0,
  ebitdaCents: 0,
  netProfitBeforeTaxCents: 0,
  netMarginPct: 0,
  monthly: [],
  kpis: {},
};

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

function getFinancials(user) {
  return isConnected(user) ? JSON.parse(JSON.stringify(DEMO_FINANCIALS)) : { ...EMPTY_FINANCIALS };
}

function getTaxProfile(user) {
  return isConnected(user) ? JSON.parse(JSON.stringify(DEMO_TAX_PROFILE)) : null;
}

function getCompany(user) {
  return isConnected(user) ? { ...DEMO_COMPANY } : null;
}

// Raw demo data for the public hub API (the extension's backend), which has no
// per-user session — treat it as the connected Stripe account.
function rawDemo() {
  return {
    company: { ...DEMO_COMPANY },
    purchases: DEMO_PURCHASES.map((p) => ({ ...p })),
    financialHealth: { ...DEMO_FINANCIAL_HEALTH },
    financials: JSON.parse(JSON.stringify(DEMO_FINANCIALS)),
    taxProfile: JSON.parse(JSON.stringify(DEMO_TAX_PROFILE)),
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
  getFinancials,
  getTaxProfile,
  getCompany,
  rawDemo,
};
