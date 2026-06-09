import { businessSnapshot } from "@/lib/data";
import { currency } from "@/lib/format";

const health = businessSnapshot.financeHealth;
const healthColor =
  health === "Healthy"
    ? "text-green-600"
    : health === "Caution"
    ? "text-amber-600"
    : "text-red-600";

interface Card {
  label: string;
  value: string;
  hint: string;
  accent?: string;
}

const cards: Card[] = [
  {
    label: "Cash Available",
    value: currency(businessSnapshot.cashAvailable),
    hint: "Money you can use right now.",
  },
  {
    label: "Revenue This Month",
    value: currency(businessSnapshot.monthlyRevenue),
    hint: "What the business brought in.",
  },
  {
    label: "Expenses This Month",
    value: currency(businessSnapshot.monthlyExpenses),
    hint: "What the business spent.",
  },
  {
    label: "Tax Reserve Needed",
    value: currency(businessSnapshot.taxReserveNeeded),
    hint: "Set this aside for taxes.",
  },
  {
    label: "Upcoming Payroll",
    value: currency(businessSnapshot.payrollDue),
    hint: `Due in ${businessSnapshot.payrollDueInDays} days.`,
  },
];

export default function SnapshotCards() {
  return (
    <section id="snapshot" className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-navy">Business Snapshot</h2>
        <p className="mt-1 text-slate-500">
          {businessSnapshot.name} · {businessSnapshot.type}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card"
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-navy">{card.value}</p>
            <p className="mt-2 text-sm text-slate-400">{card.hint}</p>
          </div>
        ))}

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
          <p className="text-sm font-medium text-slate-500">Finance Health</p>
          <p className={`mt-2 text-3xl font-bold ${healthColor}`}>{health}</p>
          <p className="mt-2 text-sm text-slate-400">
            Cash is tight — protect payroll and taxes first.
          </p>
        </div>
      </div>
    </section>
  );
}
