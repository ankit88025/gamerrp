import type { ReactNode } from "react";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-16 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold">
            Gamer<span className="text-cyan-400">RP</span>
          </a>
          <a href="/profile" className="text-sm text-slate-300 hover:text-cyan-300">
            My Profile →
          </a>
        </nav>

        <header className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            SIMPLE PLANS
          </p>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
            Level up your <span className="text-cyan-400">gaming identity.</span>
          </h1>
          <p className="mt-5 leading-7 text-slate-400">
            Build your gaming profile for free. Upgrade when you want more ways
            to showcase your journey.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <h2 className="text-xl font-semibold">Free</h2>
            <p className="mt-2 text-sm text-slate-400">Get started with GamerRP.</p>
            <p className="mt-6 text-5xl font-bold">
              ₹0 <span className="text-base font-normal text-slate-400">/ forever</span>
            </p>

            <ul className="mt-8 flex-1 space-y-4 text-sm text-slate-300">
              <PlanFeature>Build your gamer profile</PlanFeature>
              <PlanFeature>Add games and gaming experience</PlanFeature>
              <PlanFeature>Showcase skills and achievements</PlanFeature>
              <PlanFeature>Choose a free avatar preset</PlanFeature>
            </ul>

            <a href="/profile" className="mt-9 rounded-xl border border-white/20 px-5 py-3 text-center font-semibold hover:bg-white/5">
              Create your profile
            </a>
          </section>

          <section className="relative flex flex-col rounded-3xl border border-cyan-400/50 bg-gradient-to-b from-cyan-400/10 to-slate-900/60 p-8">
            <span className="absolute right-5 top-5 rounded-full border border-cyan-400/30 px-3 py-1 text-xs text-cyan-300">
              PLANNED
            </span>
            <h2 className="text-xl font-semibold">Pro</h2>
            <p className="mt-2 text-sm text-slate-400">For gamers who want to stand out.</p>
            <p className="mt-6 text-5xl font-bold">
              ₹149 <span className="text-base font-normal text-slate-400">/ month</span>
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Proposed price — subscriptions are not available yet.
            </p>

            <ul className="mt-8 flex-1 space-y-4 text-sm text-slate-300">
              <PlanFeature>Everything in Free</PlanFeature>
              <PlanFeature>Premium profile themes</PlanFeature>
              <PlanFeature>More profile customization</PlanFeature>
              <PlanFeature>Expanded gaming portfolio options</PlanFeature>
            </ul>

            <button disabled className="mt-9 cursor-not-allowed rounded-xl bg-cyan-400/20 px-5 py-3 font-semibold text-cyan-200/80">
              Pro subscriptions coming soon
            </button>
            <p className="mt-3 text-center text-xs text-slate-500">
              No payment will be taken on this page.
            </p>
          </section>
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          Start free. Upgrade when Pro features are ready.
        </p>
        <div className="mt-8 text-center">
          <a href="/" className="text-sm text-cyan-300 hover:text-cyan-200">
            ← Back to GamerRP home
          </a>
        </div>
      </div>
    </main>
  );
}

function PlanFeature({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="text-cyan-400" aria-hidden="true">✓</span>
      <span>{children}</span>
    </li>
  );
}
