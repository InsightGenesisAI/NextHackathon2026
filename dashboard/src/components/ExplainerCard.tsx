import Link from "next/link";
import { Sparkles, ShieldCheck, Wallet, Building2, ArrowRight } from "lucide-react";

const BENEFITS = [
  { icon: ShieldCheck, title: "Stops overpaying", text: "Finds cheaper options before you buy." },
  { icon: Wallet, title: "Protects your budget", text: "Checks every purchase against your cash." },
  { icon: Building2, title: "Fits your business", text: "Knows the tools you already pay for." },
];

export function ExplainerCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-b from-brand-50 to-white shadow-card">
      <div className="px-5 pt-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white">
          <Sparkles className="h-5 w-5" />
        </span>
        <h2 className="mt-3 text-base font-semibold text-ink">
          AgentCFO is your AI Finance Assistant
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          It quietly reviews purchases so you can spend with confidence.
        </p>
      </div>

      <ul className="mt-4 space-y-3 px-5">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-soft">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{title}</p>
              <p className="text-xs text-ink-soft">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="p-5">
        <Link
          href="/insights"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          See How It Works
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
