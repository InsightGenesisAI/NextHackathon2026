// Onboarding: hardcoded business questions first, then AI-generated follow-ups.
//
// AI step uses OpenAI when OPENAI_API_KEY is set (via global fetch, Node 18+).
// Falls back to a heuristic generator so onboarding never breaks without a key.

const https = require("https");

// ── Hardcoded base questions (grouped into sections) ──
// Most context is collected here. The AI step then adds targeted follow-ups
// based on these answers. `required` marks must-answer fields; the rest are
// optional but improve accuracy.
const SECTIONS = [
  {
    id: "basics",
    title: "Business basics",
    description: "The essentials about your company.",
    questions: [
      {
        id: "industry",
        label: "What type of business do you run?",
        type: "select",
        required: true,
        options: ["SaaS / Software", "E-commerce / Retail", "Agency / Consulting", "Manufacturing", "Healthcare", "Hospitality / Food", "Real Estate", "Education", "Nonprofit", "Other"],
      },
      {
        id: "subIndustry",
        label: "How would you describe your niche or specialty?",
        type: "text",
        placeholder: "e.g. B2B marketing analytics, artisan coffee roasting",
      },
      {
        id: "size",
        label: "How many people work at your company?",
        type: "select",
        required: true,
        options: ["Just me", "2–10", "11–50", "51–200", "200+"],
      },
      {
        id: "stage",
        label: "What stage is your business in?",
        type: "select",
        options: ["Just getting started", "Growing steadily", "Scaling fast", "Established / steady-state"],
      },
      {
        id: "yearsOperating",
        label: "How long have you been operating?",
        type: "select",
        options: ["Less than 1 year", "1–3 years", "3–7 years", "7+ years"],
      },
    ],
  },
  {
    id: "financials",
    title: "Money & budgets",
    description: "Helps AgentCFO judge purchases against your finances.",
    questions: [
      {
        id: "monthlyRevenue",
        label: "Roughly what's your monthly revenue?",
        type: "select",
        options: ["Pre-revenue", "Under $10k", "$10k–$50k", "$50k–$250k", "$250k–$1M", "$1M+"],
      },
      {
        id: "monthlySpend",
        label: "About how much does your business spend each month overall?",
        type: "select",
        required: true,
        options: ["Under $1,000", "$1,000–$5,000", "$5,000–$25,000", "$25,000–$100,000", "$100,000+"],
      },
      {
        id: "softwareSpend",
        label: "Of that, how much goes to software and subscriptions?",
        type: "select",
        options: ["Under $500", "$500–$2,000", "$2,000–$10,000", "$10,000+"],
      },
      {
        id: "fundingStage",
        label: "How is the business funded?",
        type: "select",
        options: ["Bootstrapped / self-funded", "Revenue-funded", "Angel / pre-seed", "Venture-backed", "Grant / nonprofit funding"],
      },
      {
        id: "cashSensitivity",
        label: "How tight is cash flow right now?",
        type: "select",
        options: ["Very tight — every dollar counts", "Careful but stable", "Comfortable", "Plenty of runway"],
      },
    ],
  },
  {
    id: "spending",
    title: "Tools & spending",
    description: "What you buy and where the money goes.",
    questions: [
      {
        id: "topCategories",
        label: "Which categories do you spend the most on?",
        type: "textarea",
        placeholder: "e.g. cloud hosting, design software, paid ads, contractor tools",
      },
      {
        id: "existingTools",
        label: "What key tools or vendors are you already paying for?",
        type: "textarea",
        placeholder: "e.g. Slack, Adobe CC, AWS, HubSpot, Figma",
      },
      {
        id: "purchaseFrequency",
        label: "How often does your team make new purchases?",
        type: "select",
        options: ["Rarely — a few times a year", "Monthly", "Weekly", "Constantly / daily"],
      },
      {
        id: "duplicateConcern",
        label: "Do you worry about paying for overlapping or duplicate tools?",
        type: "select",
        options: ["Yes, definitely", "Maybe a little", "Not really", "Not sure"],
      },
    ],
  },
  {
    id: "controls",
    title: "Approvals & priorities",
    description: "How you want AgentCFO to step in.",
    questions: [
      {
        id: "priority",
        label: "What matters most to you right now?",
        type: "select",
        required: true,
        options: ["Cutting costs", "Avoiding overspending", "Staying on budget", "Growing efficiently", "Tightening approvals"],
      },
      {
        id: "approvalThreshold",
        label: "Above what amount should a purchase get a closer review?",
        type: "select",
        options: ["Any amount", "$100", "$500", "$1,000", "$5,000+"],
      },
      {
        id: "approvers",
        label: "Who should approve larger purchases?",
        type: "text",
        placeholder: "e.g. just me, the finance lead, department heads",
      },
      {
        id: "riskTolerance",
        label: "If a review can't finish in time, what should happen?",
        type: "select",
        options: ["Pause and let me decide", "Let it through but flag it for follow-up"],
      },
    ],
  },
];

// Flattened list of all base questions (used for validation/collection).
const BASE_QUESTIONS = SECTIONS.flatMap((s) => s.questions);

function getBaseSections() {
  return SECTIONS;
}

function getBaseQuestions() {
  return BASE_QUESTIONS;
}

// ── AI follow-up questions ──
// Generates targeted follow-ups based on the (now richer) base answers. Aims
// for ~4–5 questions that fill gaps the hardcoded questions left open.
const AI_QUESTION_COUNT = 5;

function heuristicFollowups(basics) {
  const industry = (basics.industry || "").toLowerCase();
  const priority = (basics.priority || "").toLowerCase();
  const qs = [];

  // Industry-specific probes.
  if (industry.includes("saas") || industry.includes("software")) {
    qs.push("How many paid software seats does your team have, and roughly how many go unused each month?");
    qs.push("Which parts of your stack would you never cut, and which feel like 'nice to haves'?");
    qs.push("Do you prefer building tools in-house or buying off-the-shelf subscriptions?");
  } else if (industry.includes("commerce") || industry.includes("retail")) {
    qs.push("Which platforms power your storefront, payments, and fulfillment (e.g. Shopify, Stripe)?");
    qs.push("How seasonal is your revenue, and which months are your peaks and troughs?");
    qs.push("What's your typical gross margin on a sale, so we can weigh tool costs against it?");
  } else if (industry.includes("agency") || industry.includes("consulting")) {
    qs.push("Do you bill software and tool costs back to clients, or absorb them as overhead?");
    qs.push("How many active client engagements run at once, and how much do tooling needs vary between them?");
    qs.push("Are there per-project subscriptions you should cancel once an engagement ends?");
  } else if (industry.includes("manufacturing")) {
    qs.push("What share of spend goes to raw materials versus software and operations?");
    qs.push("Do you have long-term supplier contracts or volume commitments we should factor in?");
    qs.push("Which equipment or systems carry the highest maintenance or licensing costs?");
  } else if (industry.includes("healthcare")) {
    qs.push("Which purchases need to meet compliance requirements (e.g. HIPAA) before approval?");
    qs.push("How much of your spend is recurring clinical/software licensing versus one-off equipment?");
  } else if (industry.includes("hospitality") || industry.includes("food")) {
    qs.push("How do you balance spend between supplies, equipment, and software?");
    qs.push("How much does your spending swing with seasonal or weekend demand?");
  } else {
    qs.push("What are the three biggest recurring expenses for your business?");
    qs.push("Which spending categories would you most like tighter control over?");
  }

  // Priority-specific probe.
  if (priority.includes("cut") || priority.includes("overspend") || priority.includes("budget")) {
    qs.push("Where do you suspect money is being wasted today, even if you're not certain?");
  } else if (priority.includes("grow")) {
    qs.push("Which investments would you happily spend more on if they clearly drove growth?");
  } else {
    qs.push("Are there vendors or categories you'd like flagged automatically for review?");
  }

  // Always useful, only if the base answers didn't already cover approvers.
  if (!basics.approvers) {
    qs.push("Besides you, who should be able to approve larger purchases?");
  }
  qs.push("Is there anything unusual about how your business spends money that we should know?");

  // De-dupe and cap.
  return [...new Set(qs)].slice(0, AI_QUESTION_COUNT);
}

function callOpenAI(basics) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return reject(new Error("NO_API_KEY"));

    const prompt = `A small business just answered a detailed onboarding questionnaire for an AI finance assistant that reviews and approves purchases. Using their answers below, write ${AI_QUESTION_COUNT} short, specific follow-up questions that fill gaps the questionnaire didn't cover and would most improve purchase-review and budgeting accuracy. Make them concrete to this business, not generic. Avoid repeating anything they already answered. Return ONLY a JSON array of ${AI_QUESTION_COUNT} question strings.\n\nAnswers:\n${JSON.stringify(basics, null, 2)}`;

    const payload = JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: `You are a concise financial onboarding assistant. Always reply with a JSON array of exactly ${AI_QUESTION_COUNT} question strings and nothing else.` },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 500,
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
          if (Array.isArray(arr) && arr.length) return resolve(arr.slice(0, AI_QUESTION_COUNT).map(String));
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

module.exports = { getBaseSections, getBaseQuestions, generateFollowupQuestions, heuristicFollowups };
