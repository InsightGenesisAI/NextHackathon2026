"use client";

import { useState } from "react";

interface Message {
  role: "user" | "agent";
  text: string;
}

const suggestions = [
  "Can I afford new equipment this month?",
  "Should I spend more on marketing?",
  "What should I pay first?",
  "Am I ready for taxes?",
];

export default function AskAgent({
  presetQuestion,
}: {
  presetQuestion?: string;
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function send(question: string) {
    const q = question.trim();
    if (!q || loading) return;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "agent", text: data.answer ?? "Sorry, please try again." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "agent", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="ask" className="mx-auto max-w-6xl px-6 py-16">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
        <h2 className="text-2xl font-bold text-navy">Ask AgentCFO</h2>
        <p className="mt-1 text-slate-500">
          Plain-English answers about your money. No finance degree required.
        </p>

        {presetQuestion ? (
          <p className="mt-3 text-sm text-brand">Tip: {presetQuestion}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-200"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-lg rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-brand text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading ? (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm text-slate-400">
                AgentCFO is thinking…
              </div>
            </div>
          ) : null}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mt-6 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about payroll, taxes, spending…"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
          >
            Ask
          </button>
        </form>
      </div>
    </section>
  );
}
