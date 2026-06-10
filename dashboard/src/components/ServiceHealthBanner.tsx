import { CloudOff, Clock } from "lucide-react";
import type { ServiceHealth } from "@/lib/types";

// Friendly, non-breaking fallback messages for graceful degradation.
export function ServiceHealthBanner({ health }: { health: ServiceHealth }) {
  const notes: string[] = [];
  if (!health.exa) notes.push("Market data is temporarily unavailable — using your budget and company rules.");
  if (!health.openai) notes.push("AI review could not complete — you can continue or retry.");
  if (!health.stripe) notes.push("Live budget data is unavailable — using your saved budget estimate.");

  if (health.slow) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          Review is taking longer than expected. You can continue, but AgentCFO will log this
          purchase for follow-up.
        </p>
      </div>
    );
  }

  if (notes.length === 0) return null;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
      <CloudOff className="mt-0.5 h-5 w-5 shrink-0 text-ink-faint" />
      <ul className="space-y-1 text-sm text-ink-soft">
        {notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}
