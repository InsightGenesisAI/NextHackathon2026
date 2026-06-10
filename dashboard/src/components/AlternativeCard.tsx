import { Check, ArrowUpRight, Star } from "lucide-react";
import type { Alternative } from "@/lib/types";
import { money, moneyPerMonth } from "@/lib/format";
import { clsx } from "@/lib/clsx";

export function AlternativeCard({ alt }: { alt: Alternative }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border bg-white p-5 shadow-soft transition-shadow hover:shadow-card",
        alt.badge ? "border-brand-200" : "border-gray-100"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-ink">{alt.name}</h3>
            {alt.badge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                <Star className="h-3 w-3" />
                {alt.badge}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-ink-soft">{moneyPerMonth(alt.priceCents, alt.billing)}</p>
        </div>
        {alt.estSavingsCents > 0 && (
          <div className="text-right">
            <p className="text-xs text-ink-faint">You could save</p>
            <p className="text-lg font-bold text-brand-600">{money(alt.estSavingsCents)}</p>
          </div>
        )}
      </div>

      <p className="mt-3 text-sm text-ink-soft">{alt.reason}</p>

      <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
        {alt.features.map((f) => (
          <li key={f} className="flex items-center gap-1.5 text-xs text-ink-soft">
            <Check className="h-3.5 w-3.5 text-brand-500" />
            {f}
          </li>
        ))}
      </ul>

      <a
        href={alt.url || "#"}
        target={alt.url ? "_blank" : undefined}
        rel="noreferrer"
        className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100"
      >
        View Option
        <ArrowUpRight className="h-4 w-4" />
      </a>
    </div>
  );
}
