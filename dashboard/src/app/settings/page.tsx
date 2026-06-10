"use client";

import { useState } from "react";
import { ShieldCheck, Bell, Building2, Wallet } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardHeader } from "@/components/Card";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-brand-500" : "bg-gray-200"}`}
      aria-pressed={on}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [protection, setProtection] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const [riskOpen, setRiskOpen] = useState<"fail-closed" | "fail-open">("fail-closed");

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" subtitle="Tune how AgentCFO works for your business." />

      <div className="space-y-4">
        <Card>
          <CardHeader title="Protection" subtitle="Let AgentCFO review purchases as they happen." />
          <div className="space-y-1 px-5 pb-5 pt-3">
            <Row icon={ShieldCheck} title="Purchase protection" desc="Review checkouts before you buy.">
              <Toggle on={protection} onChange={setProtection} />
            </Row>
            <Row icon={Bell} title="Email alerts" desc="Get notified when something needs a look.">
              <Toggle on={alerts} onChange={setAlerts} />
            </Row>
          </div>
        </Card>

        <Card>
          <CardHeader title="If the review is slow" subtitle="What should happen if AgentCFO can't finish in time." />
          <div className="space-y-2 px-5 pb-5 pt-3">
            <RadioRow
              label="Pause and let me decide"
              desc="Hold the checkout until the review finishes or I choose to continue."
              checked={riskOpen === "fail-closed"}
              onClick={() => setRiskOpen("fail-closed")}
            />
            <RadioRow
              label="Let it through, log for follow-up"
              desc="Continue checkout and flag the purchase for later review."
              checked={riskOpen === "fail-open"}
              onClick={() => setRiskOpen("fail-open")}
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Business profile" subtitle="Helps AgentCFO understand your spending." />
          <div className="space-y-1 px-5 pb-5 pt-3">
            <Row icon={Building2} title="Company" desc="Acme Co · Small business plan" />
            <Row icon={Wallet} title="Connected card" desc="Stripe · Team tier" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: typeof ShieldCheck;
  title: string;
  desc: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-1 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-canvas text-ink-soft">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="text-xs text-ink-soft">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function RadioRow({
  label,
  desc,
  checked,
  onClick,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${
        checked ? "border-brand-300 bg-brand-50" : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          checked ? "border-brand-500" : "border-gray-300"
        }`}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />}
      </span>
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="text-xs text-ink-soft">{desc}</p>
      </div>
    </button>
  );
}
