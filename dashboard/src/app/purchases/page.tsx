import { getRecentPurchases } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { ActivityTable } from "@/components/ActivityTable";
import { Card } from "@/components/Card";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const purchases = await getRecentPurchases();

  return (
    <div>
      <PageHeader
        title="Purchases"
        subtitle="Everything AgentCFO has reviewed for you."
      />
      <Card>
        <ActivityTable purchases={purchases} />
      </Card>
    </div>
  );
}
