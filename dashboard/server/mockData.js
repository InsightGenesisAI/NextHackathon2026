// Demo data for the Purchase Review page (a standalone demo view).
//
// Note: financial/dashboard data now lives in server/stripe.js and is gated by
// the user's Stripe connection. This file only holds the review-demo content.

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

module.exports = { mockReview, mockAgentActivity };
