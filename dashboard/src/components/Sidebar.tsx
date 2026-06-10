"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingBag,
  PiggyBank,
  Lightbulb,
  Bell,
  CheckSquare,
  Settings,
  Leaf,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/purchases", label: "Purchases", icon: ShoppingBag },
  { href: "/savings", label: "Savings", icon: PiggyBank },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/todo", label: "To Do", icon: CheckSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-gray-100 bg-white px-3 py-5 lg:flex">
      <Link href="/" className="mb-6 flex items-center gap-2 px-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-soft">
          <Leaf className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold tracking-tight text-ink">AgentCFO</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-soft hover:bg-gray-50 hover:text-ink"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-brand-600" : "text-ink-faint"}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-2xl bg-brand-50 p-4">
        <p className="text-sm font-semibold text-brand-800">Protection is ON</p>
        <p className="mt-1 text-xs leading-relaxed text-brand-700">
          AgentCFO is watching your purchases in the background.
        </p>
      </div>
    </aside>
  );
}
