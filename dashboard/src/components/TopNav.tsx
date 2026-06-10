"use client";

import Link from "next/link";
import { Search, Bell, ShieldCheck } from "lucide-react";

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-gray-100 bg-white/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <Link href="/" className="flex items-center gap-2 lg:hidden">
        <span className="text-base font-bold text-ink">AgentCFO</span>
      </Link>

      <div className="hidden flex-1 items-center sm:flex">
        <div className="flex w-full max-w-md items-center gap-2 rounded-xl bg-canvas px-3 py-2">
          <Search className="h-4 w-4 text-ink-faint" />
          <input
            placeholder="Search purchases, tools, budgets…"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 sm:flex">
          <ShieldCheck className="h-3.5 w-3.5" />
          Protection ON
        </span>
        <button
          aria-label="Alerts"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft hover:bg-gray-50"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-500" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
          A
        </div>
      </div>
    </header>
  );
}
