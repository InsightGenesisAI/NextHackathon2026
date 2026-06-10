import Link from "next/link";
import { AlertCircle, Bell, ArrowRight } from "lucide-react";
import { getRecentPurchases } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { moneyPerMonth, relativeDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const purchases = await getRecentPurchases();
  const alerts = purchases.filter((p) => p.status !== "approved");

  return (
    <div>
      <PageHeader title="Alerts" subtitle="Purchases that could use a quick look." />

      {alerts.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Bell className="h-6 w-6" />
            </span>
            <p className="mt-3 text-sm font-semibold text-ink">You're all caught up</p>
            <p className="mt-1 text-sm text-ink-faint">No purchases need your attention right now.</p>
          </div>
        </Card>
      ) : (
        <ul className="space-y-3">
          {alerts.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-soft"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  p.status === "flagged" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                }`}
              >
                <AlertCircle className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{p.item}</p>
                <p className="text-xs text-ink-faint">
                  {p.vendor} · {moneyPerMonth(p.priceCents, p.billing)} · {relativeDate(p.date)}
                </p>
              </div>
              <Link
                href="/review"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Review
                <ArrowRight className="h-4 w-4" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
