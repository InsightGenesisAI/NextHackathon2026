// Tax estimation + efficiency guidance.
//
// Estimates a business's tax over an annual cycle from the financials Stripe
// provides. Uses Exa to look up location- and item-specific rates and OpenAI to
// turn findings into efficiency recommendations. Degrades gracefully to built-in
// heuristic rate tables when EXA_API_KEY / OPENAI_API_KEY are missing.
//
// IMPORTANT: estimates only — not tax advice. See DISCLAIMER below.

const https = require("https");

const DISCLAIMER =
  "These figures are automated estimates for planning purposes only — not tax, legal, or accounting advice. Tax rules vary by jurisdiction, entity type, and circumstance, and change over time. Consult a licensed tax professional before acting.";

// ── Built-in heuristic rate tables (fallback when Exa is unavailable) ──
const HEURISTIC_RATES = [
  { match: ["united states", "usa", "california"], label: "United States (federal + CA state, blended)", rates: [
    { name: "Federal corporate income tax", ratePct: 21 },
    { name: "California state corporate tax", ratePct: 8.84 },
  ] },
  { match: ["united kingdom", "uk", "england"], label: "United Kingdom", rates: [
    { name: "Corporation tax", ratePct: 25 },
  ] },
  { match: ["canada"], label: "Canada (federal + provincial, blended)", rates: [
    { name: "Federal corporate tax", ratePct: 15 },
    { name: "Provincial corporate tax", ratePct: 11.5 },
  ] },
  { match: ["ireland"], label: "Ireland", rates: [
    { name: "Trading income corporation tax", ratePct: 12.5 },
  ] },
  { match: ["australia"], label: "Australia", rates: [
    { name: "Company tax", ratePct: 30 },
  ] },
  { match: ["germany"], label: "Germany (corporate + trade, blended)", rates: [
    { name: "Corporate income tax + solidarity", ratePct: 15.8 },
    { name: "Trade tax", ratePct: 14 },
  ] },
  { match: ["singapore"], label: "Singapore", rates: [
    { name: "Corporate income tax", ratePct: 17 },
  ] },
];

const DEFAULT_RATES = {
  label: "Generic blended estimate",
  rates: [{ name: "Estimated corporate income tax", ratePct: 23 }],
};

function pickHeuristicRates(location) {
  const loc = (location || "").toLowerCase();
  for (const entry of HEURISTIC_RATES) {
    if (entry.match.some((m) => loc.includes(m))) return entry;
  }
  return DEFAULT_RATES;
}

function postJson({ hostname, path, headers, body, timeout = 9000 }) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request(
      { hostname, path, method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload), ...headers }, timeout },
      (resp) => {
        let data = "";
        resp.on("data", (c) => (data += c));
        resp.on("end", () => {
          try { resolve({ status: resp.statusCode, json: data ? JSON.parse(data) : {} }); }
          catch (e) { reject(e); }
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.write(payload);
    req.end();
  });
}

function extractJsonObject(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start > -1 && end > start) return text.slice(start, end + 1);
  return text;
}

async function searchExaTax(location, entityType) {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) throw new Error("NO_EXA_KEY");
  const { status, json } = await postJson({
    hostname: "api.exa.ai",
    path: "/search",
    headers: { "x-api-key": apiKey },
    body: {
      query: `current corporate income tax rate for a ${entityType} in ${location} small business deductions credits`,
      type: "auto",
      numResults: 5,
      contents: { text: { maxCharacters: 1200 } },
    },
  });
  if (status < 200 || status >= 300) throw new Error(`Exa HTTP ${status}`);
  return (json.results || []).map((r) => ({ title: r.title, url: r.url, text: (r.text || "").slice(0, 1200) }));
}

async function analyzeWithOpenAI({ taxProfile, financials, exaResults }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("NO_OPENAI_KEY");

  const sources = exaResults.map((r, i) => `[${i + 1}] ${r.title} (${r.url})\n${r.text}`).join("\n\n");
  const taxableUSD = Math.round(taxProfile.taxableIncomeCents / 100);
  const revenueUSD = Math.round((financials.revenue.totalCents || 0) / 100);

  const prompt = [
    `A ${taxProfile.entityType} based in ${taxProfile.location} has, for fiscal year ${taxProfile.fiscalYear}:`,
    `- Total revenue: $${revenueUSD.toLocaleString()}`,
    `- Estimated taxable income (pre-tax profit): $${taxableUSD.toLocaleString()}`,
    `- Notable expense items: ${taxProfile.notableItems.map((i) => `${i.name} ($${Math.round(i.amountCents / 100).toLocaleString()}) - ${i.note}`).join("; ")}`,
    ``,
    `Web context on applicable taxes:`,
    sources || "(no search results available)",
    ``,
    `Estimate the annual taxes. Return ONLY a JSON object with keys: jurisdictionLabel (string), components (array of {name, ratePct, estTaxCents}), totalTaxCents (integer), effectiveRatePct (number), afterTaxIncomeCents (integer), efficiencyTips (array of {title, detail, estAnnualSavingCents}), itemNotes (array of {item, note}). Base estTaxCents on the taxable income above. Keep tips concrete and legal (deductions, credits, timing, entity structure). Do not invent unrealistic savings.`,
  ].join("\n");

  const { status, json } = await postJson({
    hostname: "api.openai.com",
    path: "/v1/chat/completions",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: {
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a careful financial estimation assistant. Reply with a single JSON object and nothing else. Never claim to give professional tax advice." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 900,
    },
  });
  if (status < 200 || status >= 300) throw new Error(`OpenAI HTTP ${status}`);
  const content = json.choices && json.choices[0] && json.choices[0].message.content;
  if (!content) throw new Error("Empty response");
  return JSON.parse(extractJsonObject(content));
}

function heuristicEstimate(taxProfile, financials) {
  const taxable = taxProfile.taxableIncomeCents;
  const table = pickHeuristicRates(taxProfile.location);
  const components = table.rates.map((r) => ({
    name: r.name,
    ratePct: r.ratePct,
    estTaxCents: Math.round((taxable * r.ratePct) / 100),
  }));
  const totalTaxCents = components.reduce((s, c) => s + c.estTaxCents, 0);
  const effectiveRatePct = taxable > 0 ? +((totalTaxCents / taxable) * 100).toFixed(1) : 0;

  return {
    jurisdictionLabel: table.label,
    components,
    totalTaxCents,
    effectiveRatePct,
    afterTaxIncomeCents: taxable - totalTaxCents,
    efficiencyTips: heuristicTips(taxProfile, financials),
    itemNotes: taxProfile.notableItems.map((i) => ({ item: i.name, note: i.note })),
  };
}

function heuristicTips(taxProfile, financials) {
  const tips = [];
  const rd = taxProfile.notableItems.find((i) => /r&d|research/i.test(i.name));
  if (rd) {
    tips.push({
      title: "Claim the R&D tax credit",
      detail: "A large share of engineering payroll may qualify for research & development credits, directly offsetting tax owed.",
      estAnnualSavingCents: Math.round(rd.amountCents * 0.1),
    });
  }
  const equip = taxProfile.notableItems.find((i) => /equipment|hardware/i.test(i.name));
  if (equip) {
    tips.push({
      title: "Accelerate equipment depreciation",
      detail: "Section 179 / bonus depreciation can let you deduct qualifying equipment in the year of purchase rather than over time.",
      estAnnualSavingCents: Math.round(equip.amountCents * 0.21),
    });
  }
  tips.push({
    title: "Time discretionary expenses before year-end",
    detail: "Pre-paying deductible software, marketing, or services before the fiscal year closes can lower this year's taxable income.",
    estAnnualSavingCents: Math.round((financials.expenses.totalCents || 0) * 0.01),
  });
  tips.push({
    title: "Maximize retirement contributions",
    detail: "Employer 401(k) matching and profit-sharing contributions are deductible and improve retention.",
    estAnnualSavingCents: 1500000,
  });
  tips.push({
    title: "Review entity structure",
    detail: "Depending on profit distribution plans, an S-corp election or QSBS planning may reduce the effective rate. Confirm with a CPA.",
    estAnnualSavingCents: 0,
  });
  return tips;
}

async function estimateTaxes(taxProfile, financials) {
  if (!taxProfile) return null;

  let exaResults = [];
  let exaOk = false;
  try {
    exaResults = await searchExaTax(taxProfile.location, taxProfile.entityType);
    exaOk = exaResults.length > 0;
  } catch {
    exaOk = false;
  }

  try {
    const ai = await analyzeWithOpenAI({ taxProfile, financials, exaResults });
    const totalTaxCents = ai.totalTaxCents != null ? ai.totalTaxCents : (ai.components || []).reduce((s, c) => s + (c.estTaxCents || 0), 0);
    return {
      source: exaOk ? "exa+ai" : "ai",
      sources: exaResults.map((r) => ({ title: r.title, url: r.url })),
      jurisdictionLabel: ai.jurisdictionLabel || "Estimated jurisdiction",
      components: ai.components || [],
      totalTaxCents,
      effectiveRatePct: ai.effectiveRatePct != null ? ai.effectiveRatePct : (taxProfile.taxableIncomeCents > 0 ? +((totalTaxCents / taxProfile.taxableIncomeCents) * 100).toFixed(1) : 0),
      afterTaxIncomeCents: ai.afterTaxIncomeCents != null ? ai.afterTaxIncomeCents : taxProfile.taxableIncomeCents - totalTaxCents,
      efficiencyTips: ai.efficiencyTips || [],
      itemNotes: ai.itemNotes || taxProfile.notableItems.map((i) => ({ item: i.name, note: i.note })),
      taxableIncomeCents: taxProfile.taxableIncomeCents,
      fiscalYear: taxProfile.fiscalYear,
      disclaimer: DISCLAIMER,
    };
  } catch {
    const h = heuristicEstimate(taxProfile, financials);
    return {
      source: exaOk ? "exa+heuristic" : "heuristic",
      sources: exaResults.map((r) => ({ title: r.title, url: r.url })),
      ...h,
      taxableIncomeCents: taxProfile.taxableIncomeCents,
      fiscalYear: taxProfile.fiscalYear,
      disclaimer: DISCLAIMER,
    };
  }
}

// Synchronous base estimate (heuristic only, no external calls) — used to
// render the Taxes page instantly while AI recommendations stream in after.
function baseEstimate(taxProfile, financials) {
  if (!taxProfile) return null;
  const h = heuristicEstimate(taxProfile, financials);
  return {
    source: "heuristic",
    sources: [],
    ...h,
    taxableIncomeCents: taxProfile.taxableIncomeCents,
    fiscalYear: taxProfile.fiscalYear,
    disclaimer: DISCLAIMER,
  };
}

module.exports = { estimateTaxes, baseEstimate, DISCLAIMER };
