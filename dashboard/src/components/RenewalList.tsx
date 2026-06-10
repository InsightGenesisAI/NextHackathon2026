import { CalendarClock } from "lucide-react";
import type { Renewal } from "@/lib/types";
import { dateLabel, daysUntil, moneyPerMonth } from "@/lib/format";

export function RenewalList({ renewals }: { renewals: Renewal[] }) {
  return (
    <ul className="space-y-3">
      {renewals.map((r) => {
        const days = daysUntil(r.renewsOn);
        const soon = days <= 7;
        return (
          <li
            key={r.id}
            className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-soft"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas text-lg">
              {r.icon || "🔁"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{r.name}</p>
              <p className="text-xs text-ink-faint">
                {moneyPerMonth(r.priceCents, r.billing)} · renews {dateLabel(r.renewsOn)}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                soon ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-ink-soft"
              }`}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              {days <= 0 ? "Due now" : `${days} days`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
