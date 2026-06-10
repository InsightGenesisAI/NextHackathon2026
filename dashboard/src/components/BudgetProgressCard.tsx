import type { BudgetLine } from "@/lib/types";
import { money } from "@/lib/format";
import { clsx } from "@/lib/clsx";

function toneFor(pct: number) {
  if (pct >= 95) return { bar: "bg-rose-500", text: "text-rose-600" };
  if (pct >= 80) return { bar: "bg-amber-500", text: "text-amber-600" };
  return { bar: "bg-brand-500", text: "text-brand-600" };
}

export function BudgetProgressCard({ budget }: { budget: BudgetLine }) {
  const pct = budget.allocatedCents
    ? Math.min(100, Math.round((budget.spentCents / budget.allocatedCents) * 100))
    : 0;
  const tone = toneFor(pct);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">{budget.name}</span>
        <span className={clsx("text-sm font-semibold", tone.text)}>{pct}%</span>
      </div>
      <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className={clsx("progress-fill h-full rounded-full", tone.bar)} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-ink-faint">
        {money(budget.spentCents)} of {money(budget.allocatedCents)} used
      </p>
    </div>
  );
}
