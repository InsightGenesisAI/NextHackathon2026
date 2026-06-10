import type { TaskPriority } from "@/lib/types";

const STYLES: Record<TaskPriority, { label: string; cls: string }> = {
  high: { label: "Soon", cls: "bg-rose-50 text-rose-700" },
  medium: { label: "This week", cls: "bg-amber-50 text-amber-700" },
  low: { label: "Whenever", cls: "bg-gray-100 text-ink-soft" },
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const { label, cls } = STYLES[priority];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}
