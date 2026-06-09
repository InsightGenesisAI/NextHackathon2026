import type { DecisionStatus, RiskLevel } from "@/lib/types";

const riskStyles: Record<RiskLevel, string> = {
  Low: "bg-green-100 text-green-700 ring-green-600/20",
  Medium: "bg-amber-100 text-amber-700 ring-amber-600/20",
  High: "bg-red-100 text-red-700 ring-red-600/20",
};

const statusStyles: Record<DecisionStatus, string> = {
  "Needs Approval": "bg-slate-100 text-slate-600 ring-slate-500/20",
  Approved: "bg-green-100 text-green-700 ring-green-600/20",
  Rejected: "bg-red-100 text-red-700 ring-red-600/20",
  "Review Later": "bg-amber-100 text-amber-700 ring-amber-600/20",
};

function Pill({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  );
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return <Pill label={`${risk} risk`} className={riskStyles[risk]} />;
}

export function StatusBadge({ status }: { status: DecisionStatus }) {
  return <Pill label={status} className={statusStyles[status]} />;
}
