// Stripe data source.
//
// In this demo, the financial data "lives in Stripe" rather than locally. Until
// a user connects Stripe, the dashboard shows nothing (empty states / zeros).
// Once connected, these getters return the extensive dummy dataset below —
// standing in for what a real Stripe integration would fetch from the API.
//
// DEMO NOTE: the figures below are a rough, illustrative estimate of what
// Stripe, Inc. (the company itself) might look like, scaled from public
// reporting and press estimates. They are NOT official and are for
// demonstration only.
//
// Connection state is per-user (user.stripeConnected), set via /connect/stripe.

// ── The demo company (everything below belongs to this one account) ──
const DEMO_COMPANY = {
  name: "Stripe, Inc.",
  greetingName: "Patrick",
  entityType: "C-Corporation",
  city: "South San Francisco",
  state: "California",
  country: "United States",
  location: "South San Francisco, California, United States",
  foundedYear: 2010,
  headcount: 8500,
  paymentVolumeAnnualCents: 140000000000000, // ~$1.4T total payment volume
};

// ── Procurement / vendor spend (enterprise scale, monthly invoices) ──
// status: "approved" (cleared), "review" (awaiting okay), "flagged" (needs action)
const DEMO_PURCHASES = [
  { id: "p01", vendor: "Amazon Web Services", item: "AWS — Compute, Storage & Data Transfer", priceCents: 480000000, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-10T07:45:00Z", icon: "☁️" },
  { id: "p02", vendor: "Snowflake", item: "Snowflake — Data Cloud (Enterprise)", priceCents: 52000000, billing: "monthly", status: "flagged", savingsCents: 9000000, date: "2026-06-10T06:12:00Z", icon: "❄️" },
  { id: "p03", vendor: "Google Cloud", item: "Google Cloud — BigQuery & GKE", priceCents: 62000000, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-09T16:05:00Z", icon: "🌐" },
  { id: "p04", vendor: "Datadog", item: "Datadog — Observability (org-wide)", priceCents: 41000000, billing: "monthly", status: "flagged", savingsCents: 7500000, date: "2026-06-09T14:40:00Z", icon: "🐶" },
  { id: "p05", vendor: "Salesforce", item: "Salesforce — Sales & Service Cloud", priceCents: 29000000, billing: "monthly", status: "review", savingsCents: 4200000, date: "2026-06-09T11:22:00Z", icon: "☁️" },
  { id: "p06", vendor: "Confluent", item: "Confluent Cloud — Kafka streaming", priceCents: 14000000, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-08T15:30:00Z", icon: "🌀" },
  { id: "p07", vendor: "LinkedIn", item: "LinkedIn — Sales Navigator & Recruiter", priceCents: 12000000, billing: "monthly", status: "review", savingsCents: 1800000, date: "2026-06-08T10:05:00Z", icon: "💼" },
  { id: "p08", vendor: "Atlassian", item: "Jira + Confluence (org-wide)", priceCents: 11000000, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-07T19:18:00Z", icon: "🧩" },
  { id: "p09", vendor: "Slack", item: "Slack Enterprise Grid (8,500 seats)", priceCents: 10625000, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-07T13:02:00Z", icon: "💬" },
  { id: "p10", vendor: "Notion", item: "Notion Enterprise (8,500 seats)", priceCents: 9500000, billing: "monthly", status: "flagged", savingsCents: 2400000, date: "2026-06-06T17:44:00Z", icon: "📝" },
  { id: "p11", vendor: "Okta", item: "Okta — Workforce Identity", priceCents: 8500000, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-06T09:15:00Z", icon: "🔑" },
  { id: "p12", vendor: "Zoom", item: "Zoom — Enterprise (org-wide)", priceCents: 7200000, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-05T12:33:00Z", icon: "🎥" },
  { id: "p13", vendor: "Gong", item: "Gong — Revenue Intelligence", priceCents: 6600000, billing: "monthly", status: "review", savingsCents: 1200000, date: "2026-06-05T08:50:00Z", icon: "📞" },
  { id: "p14", vendor: "GitHub", item: "GitHub Enterprise + Copilot", priceCents: 6300000, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-04T16:20:00Z", icon: "🐙" },
  { id: "p15", vendor: "Adobe", item: "Adobe Creative Cloud (Enterprise)", priceCents: 5400000, billing: "monthly", status: "flagged", savingsCents: 1600000, date: "2026-06-04T11:11:00Z", icon: "🎨" },
  { id: "p16", vendor: "Asana", item: "Asana Enterprise+", priceCents: 5200000, billing: "monthly", status: "flagged", savingsCents: 1400000, date: "2026-06-03T14:05:00Z", icon: "✅" },
  { id: "p17", vendor: "Figma", item: "Figma Organization (design org)", priceCents: 4800000, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-03T10:40:00Z", icon: "🖌️" },
  { id: "p18", vendor: "1Password", item: "1Password Business (org-wide)", priceCents: 4200000, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-02T18:25:00Z", icon: "🔐" },
  { id: "p19", vendor: "Greenhouse", item: "Greenhouse — Recruiting (ATS)", priceCents: 3800000, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-02T09:48:00Z", icon: "🌱" },
  { id: "p20", vendor: "Workday", item: "Workday — HCM & Financials", priceCents: 18000000, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-01T13:30:00Z", icon: "🗂️" },
  { id: "p21", vendor: "Ramp", item: "Ramp — Corporate cards & spend", priceCents: 3000000, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-05-31T15:12:00Z", icon: "💳" },
  { id: "p22", vendor: "Miro", item: "Miro Enterprise (whiteboarding)", priceCents: 2600000, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-05-30T10:00:00Z", icon: "🧠" },
];

// ── Financial health (company cash + departmental budgets, monthly view) ──
const DEMO_FINANCIAL_HEALTH = {
  status: "good",
  explanation:
    "Cash position is very strong and the business is profitable on an operating basis. Infrastructure spend is the largest lever — a few tools look over-provisioned and are worth trimming.",
  cashOnHandCents: 620000000000, // ~$6.2B cash & equivalents
  runwayMonths: 15, // months of gross opex covered by cash alone (revenue aside)
  monthlyBurnCents: 41750000000, // ~$417.5M monthly gross operating cost run-rate
  trend: [402, 408, 411, 416, 420, 433, 426, 430, 436, 442, 447, 470],
  budgets: [
    { name: "Cloud & Infrastructure", allocatedCents: 65000000000, spentCents: 61800000000 },
    { name: "Software & SaaS", allocatedCents: 22000000000, spentCents: 20400000000 },
    { name: "Sales & Marketing tools", allocatedCents: 18000000000, spentCents: 15200000000 },
    { name: "Data & Analytics", allocatedCents: 12000000000, spentCents: 10900000000 },
    { name: "Security & IT", allocatedCents: 9000000000, spentCents: 7600000000 },
    { name: "People & Recruiting", allocatedCents: 7000000000, spentCents: 5400000000 },
  ],
  ledger: { cardholderTier: "Enterprise", recentApprovals: 312, remainingBudgetCents: 12700000000 },
  insight:
    "Heads up: 5 purchases are flagged and 3 are awaiting review. Acting on the flagged ones could save about $221K/mo (~$2.65M/yr).",
};

// ── Comprehensive financials (annual cycle, "from Stripe") ──
// Illustrative Stripe-scale estimate. All values in cents.
const DEMO_FINANCIALS = {
  fiscalYear: 2026,
  currency: "USD",

  // Run-rate (Stripe is largely usage-based; shown as a revenue run-rate)
  mrrCents: 50000000000, // ~$500M/mo net revenue run-rate
  arrCents: 600000000000, // ~$6.0B annualized net revenue run-rate

  // Net revenue streams (annual) — net of amounts passed to partners
  revenue: {
    totalCents: 600000000000, // ~$6.0B net revenue
    streams: [
      { name: "Payment processing", amountCents: 390000000000 }, // ~$3.9B
      { name: "Interest & float income", amountCents: 90000000000 }, // ~$900M
      { name: "Billing & subscriptions", amountCents: 52000000000 }, // ~$520M
      { name: "Connect (platforms)", amountCents: 41000000000 }, // ~$410M
      { name: "Financial services (Capital, Issuing, Treasury)", amountCents: 19000000000 }, // ~$190M
      { name: "Radar, Tax, Atlas & other", amountCents: 8000000000 }, // ~$80M
    ],
    growthYoYPct: 28,
  },

  // Expenses (annual) — includes COGS-type costs + operating expenses
  expenses: {
    totalCents: 501000000000, // ~$5.01B
    categories: [
      { name: "Payment & network costs", amountCents: 215000000000, taxCategory: "cogs" }, // ~$2.15B
      { name: "Payroll & benefits", amountCents: 140000000000, taxCategory: "payroll" }, // ~$1.4B
      { name: "Cloud & infrastructure", amountCents: 47000000000, taxCategory: "software" }, // ~$470M
      { name: "Transaction loss & fraud provisions", amountCents: 30000000000, taxCategory: "losses" }, // ~$300M
      { name: "Marketing & advertising", amountCents: 19000000000, taxCategory: "marketing" }, // ~$190M
      { name: "Office & real estate", amountCents: 15000000000, taxCategory: "rent" }, // ~$150M
      { name: "Professional services (legal/acct)", amountCents: 12000000000, taxCategory: "services" }, // ~$120M
      { name: "Software & SaaS tools", amountCents: 6500000000, taxCategory: "software" }, // ~$65M
      { name: "Travel & entertainment", amountCents: 5500000000, taxCategory: "travel" }, // ~$55M
      { name: "Equipment & hardware", amountCents: 4000000000, taxCategory: "equipment" }, // ~$40M
      { name: "Other operating", amountCents: 7000000000, taxCategory: "other" }, // ~$70M
    ],
  },

  // Cost of goods sold (annual) — payment/network costs, loss provisions, delivery infra
  cogsCents: 265000000000, // ~$2.65B

  // Derived profitability (annual)
  grossProfitCents: 335000000000, // revenue.total - cogs  (~$3.35B)
  grossMarginPct: 55.8,
  operatingExpensesCents: 236000000000, // expenses.total - cogs  (~$2.36B)
  operatingProfitCents: 99000000000, // EBIT (~$990M)
  operatingMarginPct: 16.5,
  ebitdaCents: 125000000000, // ~$1.25B
  netProfitBeforeTaxCents: 94000000000, // ~$940M taxable base (pre-tax)
  netMarginPct: 15.7,

  // Monthly P&L trend (last 12 months, cents) — net revenue vs expenses
  monthly: [
    { month: "Jul", revenueCents: 46000000000, expensesCents: 38800000000 },
    { month: "Aug", revenueCents: 47000000000, expensesCents: 39200000000 },
    { month: "Sep", revenueCents: 48000000000, expensesCents: 39800000000 },
    { month: "Oct", revenueCents: 49000000000, expensesCents: 40400000000 },
    { month: "Nov", revenueCents: 50000000000, expensesCents: 41000000000 },
    { month: "Dec", revenueCents: 52000000000, expensesCents: 42500000000 },
    { month: "Jan", revenueCents: 50500000000, expensesCents: 41800000000 },
    { month: "Feb", revenueCents: 51000000000, expensesCents: 42000000000 },
    { month: "Mar", revenueCents: 52000000000, expensesCents: 42400000000 },
    { month: "Apr", revenueCents: 53000000000, expensesCents: 43000000000 },
    { month: "May", revenueCents: 53500000000, expensesCents: 43200000000 },
    { month: "Jun", revenueCents: 54000000000, expensesCents: 46900000000 },
  ],

  // Useful ratios / KPIs
  kpis: {
    paymentVolumeAnnualCents: 140000000000000, // ~$1.4T
    takeRatePctNet: 0.43, // net revenue / payment volume
    grossMarginPct: 55.8,
    ruleOf40: 43.7, // growth (28) + operating margin (16.5) ≈ 44.5
    netRevenueRetentionPct: 122,
  },
};

// ── Tax profile (inputs the tax estimator uses; "from Stripe" + company) ──
const DEMO_TAX_PROFILE = {
  entityType: DEMO_COMPANY.entityType,
  location: DEMO_COMPANY.location,
  country: DEMO_COMPANY.country,
  state: DEMO_COMPANY.state,
  taxableIncomeCents: DEMO_FINANCIALS.netProfitBeforeTaxCents, // ~$940M
  fiscalYear: DEMO_FINANCIALS.fiscalYear,
  // Items/categories that may carry different treatment (deductions/credits).
  notableItems: [
    { name: "R&D / engineering payroll", amountCents: 62000000000, note: "May qualify for R&D tax credit (Section 41)" },
    { name: "Cloud & software", amountCents: 53500000000, note: "Generally fully deductible operating expense" },
    { name: "Transaction loss provisions", amountCents: 30000000000, note: "Bad-debt / loss reserves may be deductible when incurred" },
    { name: "Equipment & hardware", amountCents: 4000000000, note: "May be eligible for bonus depreciation" },
    { name: "Travel & entertainment", amountCents: 5500000000, note: "Meals often only 50% deductible" },
    { name: "Marketing & advertising", amountCents: 19000000000, note: "Generally fully deductible" },
  ],
};

// ── Actions: to-dos, upcoming renewals, recommendations ──
const DEMO_ACTIONS = {
  todos: [
    { id: "t1", title: "Review 5 flagged purchases", detail: "Snowflake, Datadog, Notion, Adobe, and Asana look over-provisioned.", priority: "high", done: false },
    { id: "t2", title: "Approve pending Salesforce renewal", detail: "$290K/mo Sales & Service Cloud is awaiting your okay.", due: "2026-06-12", priority: "high", done: false },
    { id: "t3", title: "Negotiate AWS committed-use discount", detail: "At $4.8M/mo, a longer commitment could cut 12–18%.", due: "2026-06-20", priority: "high", done: false },
    { id: "t4", title: "Right-size Datadog hosts & ingestion", detail: "Observability spend is up 22% QoQ — trim unused hosts.", due: "2026-06-18", priority: "medium", done: false },
    { id: "t5", title: "Consolidate Asana into Jira", detail: "Two project tools overlap across teams.", due: "2026-07-01", priority: "medium", done: false },
    { id: "t6", title: "Audit Snowflake warehouse sizing", detail: "Auto-suspend and right-size to curb idle compute.", priority: "medium", done: false },
    { id: "t7", title: "Reclaim unused Adobe & Notion seats", detail: "~1,200 seats inactive 30+ days across both.", priority: "low", done: false },
  ],
  renewals: [
    { id: "r1", name: "Workday HCM & Financials", priceCents: 18000000, billing: "monthly", renewsOn: "2026-06-13", icon: "🗂️" },
    { id: "r2", name: "Salesforce", priceCents: 29000000, billing: "monthly", renewsOn: "2026-06-16", icon: "☁️" },
    { id: "r3", name: "Datadog", priceCents: 41000000, billing: "monthly", renewsOn: "2026-06-18", icon: "🐶" },
    { id: "r4", name: "Snowflake", priceCents: 52000000, billing: "monthly", renewsOn: "2026-06-22", icon: "❄️" },
    { id: "r5", name: "Amazon Web Services", priceCents: 480000000, billing: "monthly", renewsOn: "2026-06-24", icon: "☁️" },
    { id: "r6", name: "Okta", priceCents: 8500000, billing: "monthly", renewsOn: "2026-06-28", icon: "🔑" },
    { id: "r7", name: "Confluent Cloud", priceCents: 14000000, billing: "monthly", renewsOn: "2026-07-01", icon: "🌀" },
    { id: "r8", name: "GitHub Enterprise", priceCents: 6300000, billing: "monthly", renewsOn: "2026-07-03", icon: "🐙" },
  ],
  recommended: [
    { id: "ra1", title: "Lock an AWS 3-year commitment", detail: "Committed-use / savings plans could cut ~15% — about $720K/mo.", priority: "high" },
    { id: "ra2", title: "Right-size Snowflake warehouses", detail: "Auto-suspend + sizing could save ~$90K/mo.", priority: "high" },
    { id: "ra3", title: "Trim Datadog hosts & log ingestion", detail: "Drop unused monitors and cap ingestion — saves ~$75K/mo.", priority: "high" },
    { id: "ra4", title: "Consolidate Asana into Jira", detail: "Remove the overlapping tool — saves ~$52K/mo.", priority: "medium" },
    { id: "ra5", title: "Reclaim inactive Adobe/Notion seats", detail: "Recover ~1,200 unused seats — saves ~$40K/mo.", priority: "medium" },
    { id: "ra6", title: "Renegotiate Salesforce at renewal", detail: "Annual prepay + seat right-size — saves ~$42K/mo.", priority: "medium" },
  ],
};

// ── Top-line summary (dashboard recomputes some fields from purchases) ──
const DEMO_SUMMARY = {
  greetingName: DEMO_COMPANY.greetingName,
  protectionOn: true,
  potentialSavingsCents: 29100000, // ~$291K/mo across flagged + review items
  activeReviews: 8,
  budgetHealth: "good",
  monthSpendCents: 636025000, // ~$6.36M/mo on monitored tools
  monthSpendChangePct: 6,
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
