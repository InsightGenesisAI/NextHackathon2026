import { NextResponse } from "next/server";
import { AGENT_SYSTEM_PROMPT, businessSnapshot, fallbackDecisions } from "@/lib/data";
import type { Decision } from "@/lib/types";

export const runtime = "nodejs";

const ALLOWED_RISK = new Set(["Low", "Medium", "High"]);

function sanitize(raw: unknown): Decision[] | null {
  if (!Array.isArray(raw)) return null;
  const cleaned: Decision[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const d = item as Record<string, unknown>;
    const riskLevel = ALLOWED_RISK.has(String(d.riskLevel))
      ? (d.riskLevel as Decision["riskLevel"])
      : "Medium";
    cleaned.push({
      id: String(d.id ?? crypto.randomUUID()),
      title: String(d.title ?? "Untitled decision"),
      whatHappened: String(d.whatHappened ?? ""),
      whyItMatters: String(d.whyItMatters ?? ""),
      recommendedAction: String(d.recommendedAction ?? ""),
      amount: String(d.amount ?? ""),
      riskLevel,
      status: "Needs Approval",
    });
  }
  return cleaned.length ? cleaned : null;
}

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;

  // No key configured: gracefully fall back so the UI never breaks.
  if (!apiKey) {
    return NextResponse.json({ source: "fallback", decisions: fallbackDecisions });
  }

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });

    const userPrompt = `Here is the business financial snapshot as JSON:\n${JSON.stringify(
      businessSnapshot,
      null,
      2
    )}\n\nReturn ONLY a JSON object with a single key "decisions" whose value is an array of recommended financial decisions. Each decision must have this exact shape: {"id": string, "title": string, "whatHappened": string, "whyItMatters": string, "recommendedAction": string, "amount": string, "riskLevel": "Low" | "Medium" | "High", "status": "Needs Approval"}. Keep every explanation short and plain-English.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: AGENT_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty completion");

    const parsed = JSON.parse(content);
    const decisions = sanitize(parsed.decisions ?? parsed);
    if (!decisions) throw new Error("Unusable AI response");

    return NextResponse.json({ source: "ai", decisions });
  } catch (err) {
    console.error("analyze-finances fallback:", err);
    return NextResponse.json({ source: "fallback", decisions: fallbackDecisions });
  }
}
