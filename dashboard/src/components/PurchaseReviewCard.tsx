"use client";

import { useState } from "react";
import { AlertCircle, FileText, X, Check } from "lucide-react";
import type { PurchaseReview } from "@/lib/types";
import { money, moneyPerMonth } from "@/lib/format";
import { resolvePurchase, reviewJustification } from "@/lib/api";
import { AlternativeCard } from "./AlternativeCard";

type Phase = "idle" | "working" | "held" | "approved" | "cancelled";

export function PurchaseReviewCard({ review }: { review: PurchaseReview }) {
  const [justification, setJustification] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");

  const totalMonthlySavings = review.alternatives.reduce(
    (max, a) => Math.max(max, a.estSavingsCents),
    review.estSavingsCents
  );

  async function handleCancel() {
    setPhase("working");
    setMessage("Cancelling this purchase…");
    const res = await resolvePurchase(review.authId, "decline");
    setPhase("cancelled");
    setMessage(res.message || "Purchase cancelled.");
  }

  async function handleSubmitJustification() {
    if (!justification.trim()) {
      setMessage("Add a quick note so AgentCFO can review it.");
      return;
    }
    setPhase("working");
    setMessage("AgentCFO is reviewing your note…");
    const review2 = await reviewJustification(review.authId, justification);
    if (!review2.approved) {
      setPhase("held");
      setMessage(review2.reasoning || "AgentCFO suggests a closer look before buying.");
      return;
    }
    const res = await resolvePurchase(review.authId, "approve", justification);
    setPhase("approved");
    setMessage(res.message || "Approved. You can continue checkout.");
  }

  async function handleContinueAnyway() {
    setPhase("working");
    const res = await resolvePurchase(review.authId, "approve", justification || "User chose to continue.");
    setPhase("approved");
    setMessage(res.message || "Approved. You can continue checkout.");
  }

  const resolved = phase === "approved" || phase === "cancelled";

  return (
    <div className="space-y-5">
      {/* Original detected purchase */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-600 shadow-soft">
            <AlertCircle className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Worth reviewing
            </p>
            <h3 className="mt-0.5 text-base font-semibold text-ink">{review.item}</h3>
            <p className="text-sm text-ink-soft">
              {review.vendor} · {moneyPerMonth(review.currentPriceCents, review.billing)}
            </p>
            <p className="mt-2 text-sm text-ink">{review.flagReason}</p>
          </div>
        </div>
      </div>

      {/* Alternatives */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">Better options we found</h3>
        <div className="space-y-3">
          {review.alternatives.map((alt) => (
            <AlternativeCard key={alt.id} alt={alt} />
          ))}
        </div>
      </div>

      {/* Savings insight bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-brand-500 px-5 py-4 text-white">
        <p className="text-sm">
          Original: <span className="font-semibold">{review.item}</span> at{" "}
          {moneyPerMonth(review.currentPriceCents, review.billing)}
        </p>
        <p className="text-sm font-semibold">
          You could save up to {money(totalMonthlySavings)}/mo
        </p>
      </div>

      {/* Justification + actions */}
      {!resolved ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
          <label htmlFor="why" className="text-sm font-medium text-ink">
            {review.contextQuestion}
          </label>
          <textarea
            id="why"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            rows={3}
            placeholder="Why do you need this specific option?"
            className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-canvas px-3.5 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand-300 focus:bg-white"
          />

          {message && (
            <p
              className={`mt-3 rounded-xl px-3.5 py-2.5 text-sm ${
                phase === "held" ? "bg-amber-50 text-amber-700" : "bg-canvas text-ink-soft"
              }`}
            >
              {message}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleCancel}
              disabled={phase === "working"}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Cancel Purchase
            </button>
            <button
              onClick={handleSubmitJustification}
              disabled={phase === "working"}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50 sm:flex-none"
            >
              <FileText className="h-4 w-4" />
              Submit Justification
            </button>
            <button
              onClick={handleContinueAnyway}
              disabled={phase === "working"}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`flex items-center gap-3 rounded-2xl p-5 ${
            phase === "approved" ? "bg-brand-50 text-brand-800" : "bg-gray-50 text-ink-soft"
          }`}
        >
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              phase === "approved" ? "bg-brand-500 text-white" : "bg-gray-200 text-ink-soft"
            }`}
          >
            {phase === "approved" ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </span>
          <div>
            <p className="text-sm font-semibold">
              {phase === "approved" ? "All set!" : "Purchase cancelled"}
            </p>
            <p className="text-sm">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
