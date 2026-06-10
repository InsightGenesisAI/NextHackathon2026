import { PiggyBank, TrendingDown, Repeat } from "lucide-react";
import { getRecentPurchases, getDashboardSummary } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardHeader } from "@/components/Card";
import { money } from "@/lib/format";
import { SavingsBadge } from "@/components/SavingsBadge";

export const dynamic = "force-dynamic";

export default async function SavingsPage() {
  const [purchases, summary] = await Promise.all([getRecentPurchases(), getDashboardSummary()]);
  const withSavings = purchases.filter((p) => p.savingsCents > 0);
  const realized = purchases
    .filter((p) => p.status === "approved")
    .reduce((sum, p) => sum + p.savingsCents, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Savings" subtitle="Money AgentCFO has helped you keep." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Potential Savings" value={money(summary.potentialSavingsCents)} icon={PiggyBank} tone="good" />
        <MetricCard label="Saved So Far" value={money(realized)} icon={TrendingDown} tone="good" />
        <MetricCard label="Opportunities" value={String(withSavings.length)} sub="Worth a look" icon={Repeat} tone="watch" />
      </div>

      <Card>
        <CardHeader title="Savings opportunities" subtitle="Where you could spend less." />
        {withSavings.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink-faint">
            Nothing to save right now — your spending looks efficient.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50 px-5 py-2">
            {withSavings.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-canvas text-lg">
                  {p.icon || "🧾"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{p.item}</p>
                  <p className="text-xs text-ink-faint">{p.vendor}</p>
                </div>
                <SavingsBadge cents={p.savingsCents} potential={p.status !== "approved"} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
