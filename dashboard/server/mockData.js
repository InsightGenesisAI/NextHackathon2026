// Seed data for the AgentCFO hub. Plain JS port of the original mock data.

const mockSummary = {
  greetingName: "Alex",
  protectionOn: true,
  potentialSavingsCents: 184200,
  activeReviews: 3,
  budgetHealth: "good",
  monthSpendCents: 982400,
  monthSpendChangePct: -8,
};

const mockRecentPurchases = [
  { id: "p1", vendor: "Slack", item: "Slack Business+", priceCents: 1500, billing: "monthly", status: "approved", savingsCents: 0, date: "2026-06-09T09:12:00Z", icon: "💬" },
  { id: "p2", vendor: "Notion", item: "Notion Team Plan", priceCents: 2000, billing: "monthly", status: "review", savingsCents: 4800, date: "2026-06-09T08:40:00Z", icon: "📝" },
  { id: "p3", vendor: "Adobe", item: "Adobe Creative Cloud", priceCents: 5999, billing: "monthly", status: "flagged", savingsCents: 12000, date: "2026-06-08T16:05:00Z", icon: "🎨" },
  { id: "p4", vendor: "Semrush", item: "SEMrush Pro", priceCents: 13999, billing: "monthly", status: "flagged", savingsCents: 6000, date: "2026-06-08T11:22:00Z", icon: "📈" },
];

const mockReview = {
  authId: "iauth_demo_0001",
  vendor: "Adobe",
  item: "Adobe Creative Cloud — All Apps",
  currentPriceCents: 5999,
  billing: "monthly",
  flagReason: "This is about 38% above comparable tools your team could use.",
  conciseAnalysis:
    "This plan costs more than similar tools on the market, and your team already has overlapping design software.",
  contextQuestion: "Why do you need the full Creative Cloud suite instead of a single app?",
  isFlagged: true,
  confidence: 0.82,
  marketPremiumPercent: 38,
  estSavingsCents: 4000,
  alternatives: [
    { id: "a1", name: "Affinity Suite", priceCents: 0, billing: "annual", estSavingsCents: 5999, reason: "One-time purchase covers photo, design, and publishing. No monthly fee.", features: ["Photo editing", "Vector design", "Publishing", "One-time price"], badge: "Best Value", url: "https://affinity.serif.com" },
    { id: "a2", name: "Adobe Single App (Photoshop)", priceCents: 1999, billing: "monthly", estSavingsCents: 4000, reason: "If you only use Photoshop, the single-app plan saves $40/mo.", features: ["Photoshop", "Cloud storage", "Adobe Fonts"], badge: "Recommended", url: "https://adobe.com" },
    { id: "a3", name: "Canva Pro", priceCents: 1299, billing: "monthly", estSavingsCents: 4700, reason: "Great for quick marketing assets and team collaboration.", features: ["Templates", "Brand kit", "Team sharing", "Easy to learn"], url: "https://canva.com" },
  ],
};

const mockFinancialHealth = {
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

const mockActions = {
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

const mockAgentActivity = {
  steps: [
    { id: "s1", actor: "AgentCFO", label: "Read checkout details", status: "done", result: "Adobe Creative Cloud · $59.99/mo", ms: 12 },
    { id: "s2", actor: "Search Strategist", label: "Created market search query", status: "done", result: "creative suite alternatives pricing", ms: 120 },
    { id: "s3", actor: "Exa", label: "Found market alternatives", status: "done", result: "3 options found", ms: 180 },
    { id: "s4", actor: "CFO Auditor", label: "Checked budget and company rules", status: "done", result: "Within software budget", ms: 940 },
    { id: "s5", actor: "Stripe", label: "Verified financial health", status: "done", result: "Cash flow healthy", ms: 142 },
    { id: "s6", actor: "AgentCFO", label: "Recommended action", status: "done", result: "Review alternatives before buying", ms: 8 },
  ],
  auditLog: [
    { step: "Detected purchase is 38% above comparable tools." },
    { step: "Found 2 existing tools with overlapping features." },
    { step: "Software budget would remain within limit." },
    { step: "Recommended reviewing alternatives before buying." },
  ],
};

module.exports = {
  mockSummary,
  mockRecentPurchases,
  mockReview,
  mockFinancialHealth,
  mockActions,
  mockAgentActivity,
};
