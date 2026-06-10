import { CalendarClock, Sparkles } from "lucide-react";
import { getActions } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { TodoList } from "@/components/TodoList";
import { RenewalList } from "@/components/RenewalList";
import { Card, CardHeader } from "@/components/Card";
import { PriorityBadge } from "@/components/PriorityBadge";

export const dynamic = "force-dynamic";

export default async function TodoPage() {
  const { todos, renewals, recommended } = await getActions();

  return (
    <div>
      <PageHeader title="What's Next?" subtitle="Here's what AgentCFO recommends." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-faint">To do</h2>
            <TodoList items={todos} />
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-faint">
              <Sparkles className="h-4 w-4" />
              Recommended actions
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {recommended.map((r) => (
                <div key={r.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-soft">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{r.title}</p>
                    <PriorityBadge priority={r.priority} />
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">{r.detail}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div>
          <Card>
            <CardHeader title="Coming up" subtitle="Renewals in the next few weeks." />
            <div className="px-5 pb-5 pt-3">
              <RenewalList renewals={renewals} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
