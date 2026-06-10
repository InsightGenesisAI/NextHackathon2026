"use client";

import { useEffect } from "react";
import { X, ListChecks } from "lucide-react";
import type { AuditLogEntry } from "@/lib/types";

export function AuditLogDrawer({
  open,
  onClose,
  entries,
}: {
  open: boolean;
  onClose: () => void;
  entries: AuditLogEntry[];
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/20" onClick={onClose} />
      <aside className="thin-scroll relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-pop animate-soft-in">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <ListChecks className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-ink">Audit log</h3>
              <p className="text-xs text-ink-faint">What AgentCFO checked, in plain English.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-gray-50"
            aria-label="Close audit log"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ol className="space-y-3 px-5 py-5">
          {entries.map((e, i) => (
            <li key={i} className="flex gap-3 rounded-xl bg-canvas p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
                {i + 1}
              </span>
              <p className="text-sm text-ink">{e.step}</p>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
