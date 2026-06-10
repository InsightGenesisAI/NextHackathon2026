"use client";

import { useState } from "react";
import { ListChecks } from "lucide-react";
import { mockReview, mockAgentActivity } from "@/lib/mockData";
import { PageHeader } from "@/components/PageHeader";
import { PurchaseReviewCard } from "@/components/PurchaseReviewCard";
import { AgentTimeline } from "@/components/AgentTimeline";
import { AuditLogDrawer } from "@/components/AuditLogDrawer";

export default function ReviewPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Better alternatives found!"
        subtitle="We found similar options that can save your business money."
        action={
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-ink-soft hover:bg-gray-50"
          >
            <ListChecks className="h-4 w-4" />
            View audit log
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PurchaseReviewCard review={mockReview} />
        </div>
        <div className="space-y-6">
          <AgentTimeline steps={mockAgentActivity.steps} />
        </div>
      </div>

      <AuditLogDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        entries={mockAgentActivity.auditLog}
      />
    </div>
  );
}
