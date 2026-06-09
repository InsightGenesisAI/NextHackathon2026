import type { Decision, DecisionStatus } from "@/lib/types";
import { RiskBadge, StatusBadge } from "./Badge";

interface Props {
  decision: Decision;
  onUpdate: (id: string, status: DecisionStatus) => void;
  onAsk: (decision: Decision) => void;
}

const actionButton =
  "rounded-lg px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1";

export default function DecisionCard({ decision, onUpdate, onAsk }: Props) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-navy">{decision.title}</h3>
        <div className="flex flex-wrap gap-2">
          <RiskBadge risk={decision.riskLevel} />
          <StatusBadge status={decision.status} />
        </div>
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="font-medium text-slate-500">What happened</dt>
          <dd className="text-slate-700">{decision.whatHappened}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Why it matters</dt>
          <dd className="text-slate-700">{decision.whyItMatters}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Recommended action</dt>
          <dd className="text-slate-700">{decision.recommendedAction}</dd>
        </div>
      </dl>

      <p className="mt-4 text-sm font-semibold text-navy">
        Amount: <span className="text-brand">{decision.amount}</span>
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onUpdate(decision.id, "Approved")}
          className={`${actionButton} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500`}
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() => onUpdate(decision.id, "Rejected")}
          className={`${actionButton} bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-400`}
        >
          Reject
        </button>
        <button
          type="button"
          onClick={() => onUpdate(decision.id, "Review Later")}
          className={`${actionButton} bg-amber-100 text-amber-700 hover:bg-amber-200 focus:ring-amber-400`}
        >
          Review Later
        </button>
        <button
          type="button"
          onClick={() => onAsk(decision)}
          className={`${actionButton} bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400`}
        >
          Ask AI
        </button>
      </div>
    </article>
  );
}
