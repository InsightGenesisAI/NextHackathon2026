"use client";

import { useState } from "react";
import { ChevronDown, Check, Loader2, Circle, X } from "lucide-react";
import type { AgentStep, StepStatus } from "@/lib/types";
import { clsx } from "@/lib/clsx";

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done")
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white">
        <Check className="h-3.5 w-3.5" />
      </span>
    );
  if (status === "running")
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      </span>
    );
  if (status === "failed")
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <X className="h-3.5 w-3.5" />
      </span>
    );
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-ink-faint">
      <Circle className="h-2.5 w-2.5" />
    </span>
  );
}

export function AgentTimeline({ steps }: { steps: AgentStep[] }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="text-left">
          <h2 className="text-base font-semibold text-ink">How AgentCFO decided</h2>
          <p className="text-sm text-ink-soft">A quick look at the steps behind this recommendation.</p>
        </div>
        <ChevronDown className={clsx("h-5 w-5 text-ink-faint transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <ol className="space-y-1 px-5 pb-5">
          {steps.map((s, i) => (
            <li key={s.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <StepIcon status={s.status} />
                {i < steps.length - 1 && <span className="my-1 w-px flex-1 bg-gray-100" />}
              </div>
              <div className="flex-1 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">
                    <span className="text-brand-600">{s.actor}</span> · {s.label}
                  </p>
                  {typeof s.ms === "number" && (
                    <span className="shrink-0 text-xs text-ink-faint">{s.ms}ms</span>
                  )}
                </div>
                {s.result && <p className="mt-0.5 text-sm text-ink-soft">{s.result}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
