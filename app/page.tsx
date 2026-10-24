import Link from "next/link";

const freeFeatures = [
  "One gamer account and professional profile",
  "Browse the game directory and add missing titles to your own profile",
  "Games played, rank, experience, skills and achievements",
  "Free avatar presets and profile editing",
  "Community feed, discover and team opportunities",
];

const proIdeas = [
  "More profile themes, cover styles and visual customization",
  "Extra showcase sections and pinned achievements",
  "Profile-view and engagement analytics",
  "Shareable gamer portfolio / profile card options",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center md:py-28">
          <div className="mx-auto mb-6 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
            The professional network for gamers
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
            Your gaming identity.
            <span className="block text-cyan-400">Your next opportunity.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Build one profile for your games, ranks, experience, skills and achievements. Discover gamers, find teammates and show the world what you can do.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/games" className="rounded-xl bg-cyan-400 px-7 py-3.5 font-bold text-slate-950 hover:bg-cyan-300">Explore games — free</Link>
            <Link href="/pricing" className="rounded-xl border border-cyan-400/40 px-7 py-3.5 font-semibold text-cyan-200 hover:bg-cyan-400/10">Compare plans & pricing</Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">Core profile and game-selection features stay free. No payment is needed to add a game to your profile.</p>
        </div>
      </section>

      <section className="border-b border-white/10 bg-slate-900/40">
        <div className="mx-auto grid max-w-7xl gap-5 px-6 py-14 md:grid-cols-3">
          <Feature title="Gaming profile" description="Show your gamer name, bio, country, skills, ranks and experience." icon="🎮" />
          <Feature title="Your games, your way" description="Search by title or genre. If a game is missing, add its name to your own profile for free." icon="🕹️" />
          <Feature title="Meet your community" description="Discover gamers, share updates, follow players and find teammates or opportunities." icon="🌎" />
        </div>
      </section>

      <section id="plans" className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">Simple, transparent pricing</p>
          <h2 className="mt-3 text-3xl font-black md:text-5xl">Start free. Upgrade only for extras.</h2>
          <p className="mt-4 leading-7 text-slate-400">You use one GamerRP account. Visiting pricing does not create another account, remove your saved games or start a payment.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="flex flex-col rounded-3xl border border-cyan-400/40 bg-cyan-400/[0.05] p-7 sm:p-9">
            <span className="w-fit rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-200">AVAILABLE NOW</span>
            <h3 className="mt-4 text-2xl font-bold">Free</h3>
            <p className="mt-2 text-slate-400">Everything you need to build your gamer identity.</p>
            <p className="mt-5 text-5xl font-black">₹0 <span className="text-base font-medium text-slate-400">/ forever</span></p>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-300">
              {freeFeatures.map((feature) => <li key={feature} className="flex gap-3"><span className="text-cyan-300">✓</span><span>{feature}</span></li>)}
            </ul>
            <Link href="/games" className="mt-8 rounded-xl bg-cyan-400 px-5 py-3 text-center font-bold text-slate-950 hover:bg-cyan-300">Explore games free</Link>
          </section>

          <section className="flex flex-col rounded-3xl border border-white/15 bg-white/[0.03] p-7 sm:p-9">
            <span className="w-fit rounded-full border border-amber-300/30 bg-amber-300/[0.05] px-3 py-1 text-xs font-bold text-amber-200">PLANNED — NOT ON SALE</span>
            <h3 className="mt-4 text-2xl font-bold">GamerRP Pro</h3>
            <p className="mt-2 text-slate-400">Optional presentation and insight tools for serious gamers.</p>
            <p className="mt-5 text-4xl font-black">₹149 <span className="text-base font-medium text-slate-400">/ month proposed</span></p>
            <p className="mt-2 text-sm text-slate-500">Suggested pricing only; final price not decided. Annual proposal: ₹999/year.</p>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-300">
              {proIdeas.map((feature) => <li key={feature} className="flex gap-3"><span className="text-slate-500">✦</span><span>{feature}</span></li>)}
            </ul>
            <Link href="/pricing" className="mt-8 rounded-xl border border-white/15 px-5 py-3 text-center font-semibold hover:bg-white/5">See full plan details</Link>
            <p className="mt-3 text-center text-xs leading-5 text-amber-100/70">These Pro features are proposals, not live features. Checkout and payments are not enabled. No one should pay for Pro yet.</p>
          </section>
        </div>
        <div className="mt-8 text-center"><Link href="/pricing" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">View full pricing & FAQs →</Link></div>
      </section>

      <section className="border-t border-white/10 bg-slate-900/40 px-6 py-14 text-center">
        <h2 className="text-2xl font-bold md:text-3xl">Already have a GamerRP account?</h2>
        <p className="mt-3 text-slate-400">Log in to the same account to continue editing your existing profile and game list.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/login?next=%2Fprofile" className="rounded-xl border border-white/15 px-5 py-3 font-semibold hover:bg-white/5">Log in</Link>
          <Link href="/signup" className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-300">Create free account</Link>
        </div>
      </section>
      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-slate-500">
        GamerRP · Core gaming identity stays free · <Link href="/pricing" className="text-cyan-300 hover:text-cyan-200">Pricing</Link> · <Link href="/games" className="text-cyan-300 hover:text-cyan-200">Games</Link>
      </footer>
    </main>
  );
}

function Feature({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-4 text-3xl" aria-hidden="true">{icon}</div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-3 leading-7 text-slate-400">{description}</p>
    </article>
  );
}
