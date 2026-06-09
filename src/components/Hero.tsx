export default function Hero() {
  return (
    <header className="relative overflow-hidden bg-navy text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-soft to-brand-dark opacity-90" />
      <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand font-bold">
            AC
          </span>
          <span className="text-lg font-semibold">AgentCFO</span>
        </div>
        <a
          href="#decisions"
          className="text-sm font-medium text-slate-200 hover:text-white"
        >
          Decision Board
        </a>
      </nav>

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-12 text-center">
        <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-inset ring-white/20">
          Canva for small business finance
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
          Turn confusing business finances into simple decisions you can approve
          with confidence.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
          AgentCFO is an autonomous finance assistant that breaks money decisions
          into a clear approval list. You stay in control — approve, reject, or
          review later.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#decisions"
            className="rounded-xl bg-brand px-6 py-3 font-semibold shadow-lg transition hover:bg-brand-dark"
          >
            Analyze Demo Business
          </a>
          <a
            href="#decisions"
            className="rounded-xl bg-white/10 px-6 py-3 font-semibold ring-1 ring-inset ring-white/25 transition hover:bg-white/20"
          >
            View Decision Board
          </a>
        </div>
      </div>
    </header>
  );
}
