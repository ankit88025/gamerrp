import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="text-2xl font-bold">
            Gamer<span className="text-cyan-400">RP</span>
          </div>

          <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <Link href="/discover" className="hover:text-white">
              Discover
            </Link>
            <Link href="/games" className="hover:text-white">
              Games
            </Link>
            <Link href="/feed" className="hover:text-white">
              Community Feed
            </Link>
            <Link href="/opportunities" className="hover:text-white">
              Opportunities
            </Link>
            <a href="/pricing" className="text-cyan-400 hover:text-cyan-300">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:text-white">
              Log in
            </Link>

            <Link href="/signup" className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">
              Join GamerRP
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center md:py-32">
          <div className="mx-auto mb-6 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
            The professional network for gamers
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
            Build your
            <span className="text-cyan-400"> gaming identity.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Showcase your games, achievements, skills, experience and
            everything that makes you who you are in gaming.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/signup" className="rounded-xl bg-cyan-400 px-7 py-3.5 font-semibold text-slate-950 hover:bg-cyan-300">
              Create your profile
            </Link>

            <Link href="/feed" className="rounded-xl border border-white/15 px-7 py-3.5 font-semibold text-white hover:bg-white/5">
              Open community feed
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/10 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Feature
              title="Gaming Profile"
              description="Create a professional profile that represents your gaming journey."
              icon="🎮"
            />

            <Feature
              title="Achievements"
              description="Show your ranks, tournament results, milestones and accomplishments."
              icon="🏆"
            />

            <Feature
              title="Gaming Network"
              description="Discover gamers, follow players and grow your professional network."
              icon="🌎"
            />
            <Feature
              title="Community Feed"
              description="Share updates, like posts and talk with other gamers."
              icon="💬"
            />
            <Feature
              title="Team Opportunities"
              description="Post team recruitment, scrims, tournament squads and coaching opportunities."
              icon="🏆"
            />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-24 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">
          Your gaming journey deserves a profile.
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          Build it. Share it. Get discovered.
        </p>

        <Link href="/signup" className="mt-8 inline-block rounded-xl bg-cyan-400 px-7 py-3.5 font-semibold text-slate-950 hover:bg-cyan-300">
          Get started with GamerRP
        </Link>
      </section>
    </main>
  );
}

function Feature({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
      <div className="mb-5 text-3xl">{icon}</div>

      <h3 className="text-xl font-semibold">{title}</h3>

      <p className="mt-3 leading-7 text-slate-400">{description}</p>
    </div>
  );
}