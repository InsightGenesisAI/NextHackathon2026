"use client";

import { useState } from "react";
import { PiggyBank, ClipboardCheck, HeartPulse, Receipt, ShieldCheck, PlayCircle } from "lucide-react";
import type { DashboardSummary, PurchaseReview, RecentPurchase, ServiceHealth } from "@/lib/types";
import { money } from "@/lib/format";
import { MetricCard } from "./MetricCard";
import { ActivityTable } from "./ActivityTable";
import { ExplainerCard } from "./ExplainerCard";
import { Card, CardHeader } from "./Card";
import { CheckoutOverlayModal } from "./CheckoutOverlayModal";

const HEALTH_LABEL = { good: "Good", watch: "Watch", risk: "Risk" } as const;

export function HomeView({
  summary,
  purchases,
  demoReview,
}: {
  summary: DashboardSummary;
  purchases: RecentPurchase[];
  demoReview: PurchaseReview;
}) {
  const [showOverlay, setShowOverlay] = useState(false);
  const demoHealth: ServiceHealth = { exa: true, openai: true, stripe: true, slow: false };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {greeting}, {summary.greetingName}!
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">
            AgentCFO is watching your purchases and helping you make smarter spending decisions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {summary.protectionOn && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
              <ShieldCheck className="h-4 w-4" />
              Protection is ON
            </span>
          )}
          <button
            onClick={() => setShowOverlay(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-ink/90"
          >
            <PlayCircle className="h-4 w-4" />
            Demo a review
          </button>
        </div>
      </div>

      {/* Today at a glance */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-faint">
          Today at a glance
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Potential Savings"
            value={money(summary.potentialSavingsCents)}
            sub="Found across your purchases"
            icon={PiggyBank}
            tone="good"
          />
          <MetricCard
            label="Active Reviews"
            value={String(summary.activeReviews)}
            sub="Waiting for your okay"
            icon={ClipboardCheck}
            tone={summary.activeReviews > 0 ? "watch" : "good"}
          />
          <MetricCard
            label="Budget Health"
            value={HEALTH_LABEL[summary.budgetHealth]}
            sub="Across all budgets"
            icon={HeartPulse}
            tone={summary.budgetHealth}
          />
          <MetricCard
            label="This Month's Spend"
            value={money(summary.monthSpendCents)}
            sub={`${summary.monthSpendChangePct > 0 ? "+" : ""}${summary.monthSpendChangePct}% vs last month`}
            icon={Receipt}
            tone="neutral"
          />
        </div>
      </section>

      {/* Activity + explainer */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Recent activity" subtitle="What AgentCFO has reviewed lately." />
            <div className="mt-3">
              <ActivityTable purchases={purchases} />
            </div>
          </Card>
        </div>
        <ExplainerCard />
      </div>

      <CheckoutOverlayModal
        review={demoReview}
        health={demoHealth}
        open={showOverlay}
        onClose={() => setShowOverlay(false)}
      />
    </div>
  );
}
