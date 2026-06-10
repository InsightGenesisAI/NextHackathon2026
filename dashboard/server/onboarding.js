// Onboarding: hardcoded business questions first, then AI-generated follow-ups.
//
// AI step uses OpenAI when OPENAI_API_KEY is set (via global fetch, Node 18+).
// Falls back to a heuristic generator so onboarding never breaks without a key.

const https = require("https");

// ── Hardcoded base questions ──
const BASE_QUESTIONS = [
  {
    id: "industry",
    label: "What type of business do you run?",
    type: "select",
    options: ["SaaS / Software", "E-commerce / Retail", "Agency / Consulting", "Manufacturing", "Healthcare", "Hospitality / Food", "Other"],
  },
  {
    id: "size",
    label: "How many people work at your company?",
    type: "select",
    options: ["Just me", "2–10", "11–50", "51–200", "200+"],
  },
  {
    id: "monthlySpend",
    label: "Roughly how much does your business spend on software and tools each month?",
    type: "select",
    options: ["Under $500", "$500–$2,000", "$2,000–$10,000", "$10,000+"],
  },
  {
    id: "priority",
    label: "What matters most to you right now?",
    type: "select",
    options: ["Cutting costs", "Avoiding overspending", "Staying on budget", "Growing efficiently"],
  },
  {
    id: "tools",
    label: "Which tools or categories do you spend the most on? (free text)",
    type: "text",
    placeholder: "e.g. design software, cloud hosting, marketing tools",
  },
];

function getBaseQuestions() {
  return BASE_QUESTIONS;
}

// ── AI follow-up questions ──
function heuristicFollowups(basics) {
  const industry = (basics.industry || "").toLowerCase();
  const qs = [];

  if (industry.includes("saas") || industry.includes("software")) {
    qs.push("How many paid software seats does your team currently have, and are any going unused?");
    qs.push("Do you prefer building tools in-house or buying off-the-shelf subscriptions?");
  } else if (industry.includes("commerce") || industry.includes("retail")) {
    qs.push("Which platforms power your storefront and payments (e.g. Shopify, Stripe)?");
    qs.push("How seasonal is your revenue, and when are your peak months?");
  } else if (industry.includes("agency") || industry.includes("consulting")) {
    qs.push("Do you bill software costs back to clients, or absorb them as overhead?");
    qs.push("How many active client projects run at once on average?");
  } else if (industry.includes("manufacturing")) {
    qs.push("What share of spend goes to raw materials versus software and operations?");
    qs.push("Do you have long-term supplier contracts we should factor into budgets?");
  } else {
    qs.push("What are the two or three biggest recurring expenses for your business?");
    qs.push("Are there spending categories where you'd like tighter approval controls?");
  }

  qs.push("Who should be able to approve larger purchases, and is there a dollar threshold for review?");
  return qs.slice(0, 3);
}

function callOpenAI(basics) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return reject(new Error("NO_API_KEY"));

    const prompt = `A small business is onboarding to a finance assistant. Based on this profile, write 3 short, specific follow-up questions that would help tailor purchase-review and budgeting advice. Return ONLY a JSON array of strings.\n\nProfile:\n${JSON.stringify(basics, null, 2)}`;

    const payload = JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a concise financial onboarding assistant. Always reply with a JSON array of 3 question strings and nothing else." },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 300,
    });

    const reqOpts = {
      hostname: "api.openai.com",
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Content-Length": Buffer.byteLength(payload),
      },
      timeout: 8000,
    };

    const r = https.request(reqOpts, (resp) => {
      let data = "";
      resp.on("data", (c) => (data += c));
      resp.on("end", () => {
        try {
          const json = JSON.parse(data);
          const content = json.choices && json.choices[0] && json.choices[0].message.content;
          if (!content) return reject(new Error("Empty response"));
          const arr = JSON.parse(extractJsonArray(content));
          if (Array.isArray(arr) && arr.length) return resolve(arr.slice(0, 3).map(String));
          reject(new Error("Bad shape"));
        } catch (e) {
          reject(e);
        }
      });
    });
    r.on("error", reject);
    r.on("timeout", () => { r.destroy(new Error("timeout")); });
    r.write(payload);
    r.end();
  });
}

// Pull the first JSON array out of a model response (handles code fences/prose).
function extractJsonArray(text) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start > -1 && end > start) return text.slice(start, end + 1);
  return text;
}

async function generateFollowupQuestions(basics) {
  try {
    const ai = await callOpenAI(basics);
    return { source: "ai", questions: ai };
  } catch {
    return { source: "heuristic", questions: heuristicFollowups(basics) };
  }
}

module.exports = { getBaseQuestions, generateFollowupQuestions, heuristicFollowups };
