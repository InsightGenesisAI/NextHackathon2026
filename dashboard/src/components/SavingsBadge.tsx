import { TrendingDown } from "lucide-react";
import { money } from "@/lib/format";

export function SavingsBadge({ cents, potential = false }: { cents: number; potential?: boolean }) {
  if (cents <= 0) return <span className="text-sm text-ink-faint">—</span>;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
      <TrendingDown className="h-3.5 w-3.5" />
      {potential ? "Save " : "Saved "}
      {money(cents)}
    </span>
  );
}
