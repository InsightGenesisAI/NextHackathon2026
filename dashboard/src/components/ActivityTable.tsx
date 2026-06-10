import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { RecentPurchase } from "@/lib/types";
import { moneyPerMonth, relativeDate } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import { SavingsBadge } from "./SavingsBadge";

export function ActivityTable({ purchases }: { purchases: RecentPurchase[] }) {
  if (purchases.length === 0) {
    return (
      <div className="px-5 py-10 text-center">
        <p className="text-sm font-medium text-ink">No purchases yet</p>
        <p className="mt-1 text-sm text-ink-faint">
          AgentCFO will show activity here as soon as it spots a purchase.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Desktop table */}
      <table className="hidden w-full sm:table">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wide text-ink-faint">
            <th className="px-5 py-3">Purchase</th>
            <th className="px-3 py-3">Price</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">Savings</th>
            <th className="px-3 py-3">Date</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {purchases.map((p) => (
            <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-canvas/60">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-canvas text-lg">
                    {p.icon || "🧾"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{p.item}</p>
                    <p className="text-xs text-ink-faint">{p.vendor}</p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3.5 text-sm text-ink-soft">
                {moneyPerMonth(p.priceCents, p.billing)}
              </td>
              <td className="px-3 py-3.5">
                <StatusBadge status={p.status} />
              </td>
              <td className="px-3 py-3.5">
                <SavingsBadge cents={p.savingsCents} potential={p.status !== "approved"} />
              </td>
              <td className="px-3 py-3.5 text-sm text-ink-faint">{relativeDate(p.date)}</td>
              <td className="px-5 py-3.5 text-right">
                <Link
                  href={p.status === "approved" ? "/purchases" : "/review"}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-gray-100 hover:text-ink"
                  aria-label="View purchase"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <ul className="divide-y divide-gray-50 sm:hidden">
        {purchases.map((p) => (
          <li key={p.id} className="flex items-center gap-3 px-5 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas text-lg">
              {p.icon || "🧾"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{p.item}</p>
              <p className="text-xs text-ink-faint">
                {moneyPerMonth(p.priceCents, p.billing)} · {relativeDate(p.date)}
              </p>
            </div>
            <StatusBadge status={p.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}
