"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { TodoItem } from "@/lib/types";
import { dateLabel } from "@/lib/format";
import { PriorityBadge } from "./PriorityBadge";

export function TodoList({ items }: { items: TodoItem[] }) {
  const [tasks, setTasks] = useState(items);

  function toggle(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  return (
    <ul className="space-y-3">
      {tasks.map((t) => (
        <li
          key={t.id}
          className={`flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-soft transition-opacity ${
            t.done ? "border-gray-100 opacity-60" : "border-gray-100"
          }`}
        >
          <button
            onClick={() => toggle(t.id)}
            aria-label={t.done ? "Mark as not done" : "Mark as done"}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
              t.done ? "border-brand-500 bg-brand-500 text-white" : "border-gray-300 hover:border-brand-400"
            }`}
          >
            {t.done && (
              <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2.5 6.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className={`text-sm font-semibold text-ink ${t.done ? "line-through" : ""}`}>{t.title}</p>
              <PriorityBadge priority={t.priority} />
            </div>
            <p className="mt-0.5 text-sm text-ink-soft">{t.detail}</p>
            {t.due && <p className="mt-1 text-xs text-ink-faint">Due {dateLabel(t.due)}</p>}
          </div>

          <button
            className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-gray-50 hover:text-ink"
            aria-label="Take action"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
