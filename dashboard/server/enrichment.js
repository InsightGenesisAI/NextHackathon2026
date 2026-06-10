// Company enrichment: Exa search → OpenAI structuring into a fixed criteria
// schema → AI-generated context questions. All steps degrade gracefully when
// EXA_API_KEY / OPENAI_API_KEY are missing, so onboarding never breaks.

const https = require("https");

// ── Hardcoded company criteria ──
// The fixed schema Exa findings get structured into. Each field is shown on the
// confirmation form and is user-editable (here and later in Settings).
const COMPANY_CRITERIA = [
  { id: "legalName", label: "Legal / full company name", type: "text" },
  { id: "industry", label: "Industry", type: "text" },
  { id: "specialty", label: "Niche / specialty", type: "text" },
  { id: "description", label: "What the company does", type: "textarea" },
  { id: "foundedYear", label: "Year founded", type: "text" },
  { id: "employeeCount", label: "Approx. number of employees", type: "text" },
  { id: "headquarters", label: "Headquarters (city, country)", type: "text" },
  { id: "website", label: "Website", type: "text" },
  { id: "businessModel", label: "Business model (B2B, B2C, marketplace…)", type: "text" },
  { id: "keyProducts", label: "Key products or services", type: "textarea" },
];

// Hardcoded list of context criteria the on-the-spot AI questions aim to fill.
// Exa can't know these — they come from the user. Stored as JSON for reuse.
const CONTEXT_CRITERIA = [
  "typical monthly software/tools budget",
  "biggest recurring spend categories",
  "tools or vendors already paid for",
  "who approves larger purchases and any dollar threshold",
  "top financial priority right now (cut costs, grow, stay on budget)",
  "any unusual or seasonal spending patterns",
];

function getCompanyCriteria() {
  return COMPANY_CRITERIA;
}

function getContextCriteria() {
  return CONTEXT_CRITERIA;
}

// ── Generic HTTPS JSON POST ──
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

// ── Step A: Exa search for the company ──
async function searchExa({ company, country, address }) {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) throw new Error("NO_EXA_KEY");

  const queryParts = [company, country, address, "company overview about products industry"].filter(Boolean);
  const { status, json } = await postJson({
    hostname: "api.exa.ai",
    path: "/search",
    headers: { "x-api-key": apiKey },
    body: {
      query: queryParts.join(" "),
      type: "auto",
      numResults: 5,
      contents: { text: { maxCharacters: 1200 } },
    },
  });
  if (status < 200 || status >= 300) throw new Error(`Exa HTTP ${status}`);

  const results = (json.results || []).map((r) => ({
    title: r.title,
    url: r.url,
    text: (r.text || "").slice(0, 1200),
  }));
  return results;
}

function extractJsonObject(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start > -1 && end > start) return text.slice(start, end + 1);
  return text;
}

// ── Step B: structure Exa findings into the criteria schema via OpenAI ──
async function structureWithOpenAI({ company, country, address, exaResults }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("NO_OPENAI_KEY");

  const fieldList = COMPANY_CRITERIA.map((c) => `"${c.id}": ${c.label}`).join("\n");
  const sources = exaResults.map((r, i) => `[${i + 1}] ${r.title} (${r.url})\n${r.text}`).join("\n\n");

  const prompt = `You are enriching a company profile. The user signed up with:\n- Company: ${company}\n- Country: ${country || "(unknown)"}\n- Address: ${address || "(unknown)"}\n\nHere are web search results about the company:\n${sources || "(no search results available)"}\n\nFill this JSON schema using ONLY information you can reasonably infer from the results (leave a field as an empty string if unknown — do not guess wildly):\n${fieldList}\n\nAlso include:\n"confidence": a number 0-1 for how confident you are this is the right company,\n"match": true/false whether the results clearly describe this specific company.\n\nReturn ONLY a JSON object with those keys.`;

  const { status, json } = await postJson({
    hostname: "api.openai.com",
    path: "/v1/chat/completions",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: {
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "You extract structured company data and reply with a single JSON object and nothing else." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 700,
    },
  });
  if (status < 200 || status >= 300) throw new Error(`OpenAI HTTP ${status}`);

  const content = json.choices && json.choices[0] && json.choices[0].message.content;
  if (!content) throw new Error("Empty response");
  const obj = JSON.parse(extractJsonObject(content));

  const profile = {};
  for (const c of COMPANY_CRITERIA) profile[c.id] = String(obj[c.id] || "").trim();
  return { profile, confidence: typeof obj.confidence === "number" ? obj.confidence : 0.5, match: obj.match !== false };
}

// ── Orchestrator: returns enrichment result with graceful fallback ──
async function enrichCompany({ company, country, address }) {
  const base = emptyProfile();
  base.legalName = company || "";
  base.headquarters = country || "";

  let exaResults = [];
  let exaOk = false;
  try {
    exaResults = await searchExa({ company, country, address });
    exaOk = exaResults.length > 0;
  } catch {
    exaOk = false;
  }

  try {
    const { profile, confidence, match } = await structureWithOpenAI({ company, country, address, exaResults });
    // Keep the user's typed values as fallbacks where AI left blanks.
    if (!profile.legalName) profile.legalName = company || "";
    if (!profile.headquarters) profile.headquarters = country || "";
    return {
      found: match && (exaOk || confidence >= 0.6),
      source: exaOk ? "exa+ai" : "ai",
      profile,
      sources: exaResults.map((r) => ({ title: r.title, url: r.url })),
      confidence,
    };
  } catch {
    // No OpenAI (or it failed): can't structure. Return manual-entry profile.
    return { found: false, source: "manual", profile: base, sources: exaResults.map((r) => ({ title: r.title, url: r.url })), confidence: 0 };
  }
}

function emptyProfile() {
  const p = {};
  for (const c of COMPANY_CRITERIA) p[c.id] = "";
  return p;
}

// ── On-the-spot AI context questions, driven by CONTEXT_CRITERIA ──
function heuristicContextQuestions(companyProfile) {
  const industry = (companyProfile.industry || "").toLowerCase();
  const qs = [
    "Roughly what's your monthly budget for software and tools?",
    "Which categories or vendors do you spend the most on?",
    "Who should approve larger purchases, and above what dollar amount?",
    "What's your top financial priority right now — cutting costs, staying on budget, or growing?",
  ];
  if (industry.includes("commerce") || industry.includes("retail")) {
    qs.push("How seasonal is your spending, and when are your busiest months?");
  } else if (industry.includes("saas") || industry.includes("software")) {
    qs.push("How many software seats do you pay for, and are any going unused?");
  } else {
    qs.push("Is there anything unusual about how your business spends money we should know?");
  }
  return qs.slice(0, 5);
}

async function generateContextQuestions(companyProfile) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { source: "heuristic", questions: heuristicContextQuestions(companyProfile) };

  const criteria = CONTEXT_CRITERIA.map((c) => `- ${c}`).join("\n");
  const prompt = `Here is what we know about a company:\n${JSON.stringify(companyProfile, null, 2)}\n\nWrite 5 short, specific questions to ask the owner that would fill in this operational/financial context we still need:\n${criteria}\n\nMake them concrete to this company. Return ONLY a JSON array of 5 question strings.`;

  try {
    const { status, json } = await postJson({
      hostname: "api.openai.com",
      path: "/v1/chat/completions",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: {
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a concise financial onboarding assistant. Reply with a JSON array of exactly 5 question strings and nothing else." },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 500,
      },
    });
    if (status < 200 || status >= 300) throw new Error(`OpenAI HTTP ${status}`);
    const content = json.choices && json.choices[0] && json.choices[0].message.content;
    const start = content.indexOf("[");
    const end = content.lastIndexOf("]");
    const arr = JSON.parse(content.slice(start, end + 1));
    if (Array.isArray(arr) && arr.length) return { source: "ai", questions: arr.slice(0, 5).map(String) };
    throw new Error("Bad shape");
  } catch {
    return { source: "heuristic", questions: heuristicContextQuestions(companyProfile) };
  }
}

module.exports = {
  getCompanyCriteria,
  getContextCriteria,
  enrichCompany,
  generateContextQuestions,
  emptyProfile,
};
