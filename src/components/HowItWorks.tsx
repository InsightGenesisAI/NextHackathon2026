const steps = [
  {
    n: "1",
    title: "Connect or upload data",
    body: "Bring in your business financial data. For this demo we use a sample cafe.",
  },
  {
    n: "2",
    title: "AgentCFO analyzes",
    body: "It reviews cash flow, taxes, expenses, payroll, and risks for you.",
  },
  {
    n: "3",
    title: "You decide",
    body: "Approve, reject, or review the suggested actions. You stay in control.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-bold text-navy">How AgentCFO Works</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.n}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-lg font-bold text-white">
                {step.n}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-navy">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-gradient-to-br from-navy to-brand-dark p-8 text-white">
          <h3 className="text-xl font-semibold">Where AgentCFO is headed</h3>
          <p className="mt-3 max-w-3xl text-slate-200">
            Future versions of AgentCFO could connect to bank accounts,
            accounting platforms, payroll systems, tax software, invoices,
            Shopify, Stripe, Square, and payment processors to become a complete
            autonomous financial decision-making system for small businesses.
          </p>
        </div>
      </div>
    </section>
  );
}
