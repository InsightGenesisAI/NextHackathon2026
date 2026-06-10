import { getFinancialHealth } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { FinancialHealthCard } from "@/components/FinancialHealthCard";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const health = await getFinancialHealth();

  return (
    <div>
      <PageHeader
        title="Your Financial Health"
        subtitle="Real-time snapshot of your business."
      />
      <FinancialHealthCard health={health} />
    </div>
  );
}
