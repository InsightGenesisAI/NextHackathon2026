import { getDashboardSummary, getRecentPurchases } from "@/lib/api";
import { mockReview } from "@/lib/mockData";
import { HomeView } from "@/components/HomeView";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [summary, purchases] = await Promise.all([
    getDashboardSummary(),
    getRecentPurchases(),
  ]);

  return <HomeView summary={summary} purchases={purchases} demoReview={mockReview} />;
}
