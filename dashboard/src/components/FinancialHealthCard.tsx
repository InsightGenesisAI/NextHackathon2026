import { Wallet, TrendingUp, Flame, CreditCard } from "lucide-react";
import type { FinancialHealth } from "@/lib/types";
import { money } from "@/lib/format";
import { clsx } from "@/lib/clsx";
import { Sparkline } from "./Sparkline";
import { BudgetProgressCard } from "./BudgetProgressCard";

const STATUS = {
  good: { label: "Cash flow looks good", cls: "bg-brand-50 text-brand-700", dot: "bg-brand-500" },
  watch: { label: "Worth watching", cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  risk: { label: "Needs attention", cls: "bg-rose-50 text-rose-700", dot: "bg-rose-500" },
};

export function FinancialHealthCard({ health }: { health: FinancialHealth }) {
  const status = STATUS[health.status];

  return (
    <div className="space-y-5">
      {/* Cash flow status */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                status.cls
              )}
            >
              <span className={clsx("h-2 w-2 rounded-full", status.dot)} />
              {status.label}
            </span>
            <p className="mt-3 max-w-md text-sm text-ink-soft">{health.explanation}</p>
          </div>
          <Sparkline data={health.trend} className="h-16 w-48" />
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Metric icon={Wallet} label="Cash on Hand" value={money(health.cashOnHandCents)} />
        <Metric icon={TrendingUp} label="Runway" value={`${health.runwayMonths} months`} />
        <Metric icon={Flame} label="Monthly Burn" value={money(health.monthlyBurnCents)} />
      </div>

      {/* Budgets */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
        <h2 className="text-base font-semibold text-ink">Budget overview</h2>
        <p className="mt-0.5 text-sm text-ink-soft">How much of each budget you have used.</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {health.budgets.map((b) => (
            <BudgetProgressCard key={b.name} budget={b} />
          ))}
        </div>
      </div>

      {/* Ledger + insight */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <CreditCard className="h-4 w-4" />
            </span>
            <h2 className="text-base font-semibold text-ink">Company card</h2>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <dt className="text-xs text-ink-faint">Card tier</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">{health.ledger.cardholderTier}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Recent approvals</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">{health.ledger.recentApprovals}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Budget left</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">
                {money(health.ledger.remainingBudgetCents)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex items-center rounded-2xl border border-brand-100 bg-brand-50 p-5">
          <p className="text-sm font-medium text-brand-800">{health.insight}</p>
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm text-ink-soft">{label}</p>
      <p className="mt-0.5 text-xl font-bold text-ink">{value}</p>
    </div>
  );
}
