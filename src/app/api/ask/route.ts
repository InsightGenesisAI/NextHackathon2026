import { NextResponse } from "next/server";
import { AGENT_SYSTEM_PROMPT, businessSnapshot } from "@/lib/data";

export const runtime = "nodejs";

function fallbackAnswer(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("equipment") || q.includes("afford")) {
    return "Not yet. You should first protect payroll and set aside your estimated tax reserve. After the overdue invoice is collected, you can revisit equipment spending.";
  }
  if (q.includes("marketing") || q.includes("ad")) {
    return "Hold off for now. Payroll of $4,800 and your $3,100 tax reserve come first while cash is tight. Once those are covered, a small campaign is reasonable.";
  }
  if (q.includes("pay first") || q.includes("priorit")) {
    return "Pay in this order: payroll first, then your tax reserve, then chase the $2,400 overdue invoice. Optional spending comes last.";
  }
  if (q.includes("tax")) {
    return "Almost. Move $3,100 into a separate tax reserve now so taxes do not become a surprise. That single step gets you ready.";
  }
  return "Focus on the essentials first: protect payroll, set aside your tax reserve, and collect the overdue invoice. Once those are handled, you will have room for optional spending.";
}

export async function POST(request: Request) {
  let question = "";
  try {
    const body = await request.json();
    question = String(body?.question ?? "").slice(0, 500);
  } catch {
    question = "";
  }

  if (!question.trim()) {
    return NextResponse.json({ answer: "Ask me anything about your business finances." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ answer: fallbackAnswer(question), source: "fallback" });
  }

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: AGENT_SYSTEM_PROMPT },
        {
          role: "system",
          content: `Business snapshot JSON: ${JSON.stringify(businessSnapshot)}. Answer in 2-4 short, supportive, plain-English sentences.`,
        },
        { role: "user", content: question },
      ],
    });

    const answer =
      completion.choices[0]?.message?.content?.trim() || fallbackAnswer(question);
    return NextResponse.json({ answer, source: "ai" });
  } catch (err) {
    console.error("ask fallback:", err);
    return NextResponse.json({ answer: fallbackAnswer(question), source: "fallback" });
  }
}
