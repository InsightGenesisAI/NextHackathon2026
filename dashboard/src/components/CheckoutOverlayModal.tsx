"use client";

import { useEffect, useState } from "react";
import { Leaf, X, Check, ArrowRight } from "lucide-react";
import type { PurchaseReview, ServiceHealth } from "@/lib/types";
import { money, moneyPerMonth } from "@/lib/format";
import { resolvePurchase, reviewJustification } from "@/lib/api";
import { ServiceHealthBanner } from "./ServiceHealthBanner";

type Phase = "review" | "working" | "held" | "approved" | "cancelled";

export function CheckoutOverlayModal({
  review,
  health,
  open,
  onClose,
}: {
  review: PurchaseReview;
  health: ServiceHealth;
  open: boolean;
  onClose: () => void;
}) {
  const [justification, setJustification] = useState("");
  const [phase, setPhase] = useState<Phase>("review");
  const [message, setMessage] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const best = review.alternatives.reduce(
    (b, a) => (a.estSavingsCents > (b?.estSavingsCents ?? -1) ? a : b),
    review.alternatives[0]
  );

  async function handleCancel() {
    setPhase("working");
    await resolvePurchase(review.authId, "decline");
    setPhase("cancelled");
    setMessage("No problem — we cancelled this purchase for you.");
  }

  async function handleContinue() {
    if (!justification.trim()) {
      setMessage("A quick note helps AgentCFO learn what your business needs.");
      return;
    }
    setPhase("working");
    const r = await reviewJustification(review.authId, justification);
    if (!r.approved) {
      setPhase("held");
      setMessage(r.reasoning || "AgentCFO suggests taking another look first.");
      return;
    }
    await resolvePurchase(review.authId, "approve", justification);
    setPhase("approved");
    setMessage("Great — you're all set to continue checkout.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-pop animate-soft-in">
        {/* Header */}
        <div className="flex items-center gap-3 bg-brand-500 px-5 py-4 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <Leaf className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h2 className="text-base font-semibold">Quick purchase review</h2>
            <p className="text-sm text-white/85">AgentCFO found a way your business might save money.</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/15"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {(health.slow || !health.exa || !health.openai || !health.stripe) && (
            <ServiceHealthBanner health={health} />
          )}

          {phase === "approved" || phase === "cancelled" ? (
            <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white">
                {phase === "approved" ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
              </span>
              <p className="text-sm font-medium text-brand-800">{message}</p>
            </div>
          ) : (
            <>
              {/* Current vs better */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-gray-100 bg-canvas p-4">
                  <p className="text-xs font-medium text-ink-faint">Current purchase</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{review.item}</p>
                  <p className="text-sm text-ink-soft">
                    {moneyPerMonth(review.currentPriceCents, review.billing)}
                  </p>
                </div>
                {best && (
                  <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
                    <p className="text-xs font-medium text-brand-700">Better option</p>
                    <p className="mt-1 text-sm font-semibold text-ink">{best.name}</p>
                    <p className="text-sm text-brand-700">Save {money(best.estSavingsCents)}/mo</p>
                  </div>
                )}
              </div>

              {/* Budget impact */}
              <div className="rounded-2xl bg-canvas px-4 py-3">
                <p className="text-sm text-ink-soft">{review.conciseAnalysis}</p>
              </div>

              {/* AI question */}
              <div>
                <label htmlFor="ctx" className="text-sm font-medium text-ink">
                  {review.contextQuestion}
                </label>
                <textarea
                  id="ctx"
                  rows={2}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Why do you need this specific option?"
                  className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand-300 focus:bg-white"
                />
              </div>

              {message && (
                <p
                  className={`rounded-xl px-3.5 py-2.5 text-sm ${
                    phase === "held" ? "bg-amber-50 text-amber-700" : "bg-canvas text-ink-soft"
                  }`}
                >
                  {message}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  disabled={phase === "working"}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel Purchase
                </button>
                <button
                  onClick={handleContinue}
                  disabled={phase === "working"}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
                >
                  Continue with Justification
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
