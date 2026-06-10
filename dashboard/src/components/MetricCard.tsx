import type { LucideIcon } from "lucide-react";
import { clsx } from "@/lib/clsx";

export function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  tone?: "good" | "watch" | "risk" | "neutral";
}) {
  const toneCls = {
    good: "bg-brand-50 text-brand-600",
    watch: "bg-amber-50 text-amber-600",
    risk: "bg-rose-50 text-rose-600",
    neutral: "bg-gray-50 text-ink-soft",
  }[tone];

  return (
    <div className="animate-soft-in rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-soft">{label}</span>
        <span className={clsx("flex h-9 w-9 items-center justify-center rounded-xl", toneCls)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-faint">{sub}</p>}
    </div>
  );
}
