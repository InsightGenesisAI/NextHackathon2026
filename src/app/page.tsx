import AskAgent from "@/components/AskAgent";
import DecisionBoard from "@/components/DecisionBoard";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import SnapshotCards from "@/components/SnapshotCards";

export default function Home() {
  return (
    <main>
      <Hero />
      <SnapshotCards />
      <DecisionBoard />
      <AskAgent />
      <HowItWorks />
      <footer className="bg-navy py-8 text-center text-sm text-slate-400">
        <p>
          AgentCFO — an autonomous finance assistant that turns messy business
          finances into a simple approval list of smart decisions.
        </p>
        <p className="mt-1">Demo data only · Insight Genesis 2026</p>
      </footer>
    </main>
  );
}
