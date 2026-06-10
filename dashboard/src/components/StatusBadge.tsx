import type { PurchaseStatus } from "@/lib/types";

const STYLES: Record<PurchaseStatus, { label: string; cls: string }> = {
  approved: { label: "Approved", cls: "bg-brand-50 text-brand-700" },
  review: { label: "Review", cls: "bg-amber-50 text-amber-700" },
  flagged: { label: "Action needed", cls: "bg-rose-50 text-rose-700" },
};

export function StatusBadge({ status }: { status: PurchaseStatus }) {
  const { label, cls } = STYLES[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}
