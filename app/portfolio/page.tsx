"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ValorantData = { experience?: string; role?: string; currentRank?: string; highestRank?: string; competitive?: string; achievements?: string };
type GamerProfile = { user_id: string; gamer_name: string | null; bio: string | null; country: string | null; selected_games: string[] | null; gaming_skills: string[] | null; avatar_style: string | null; valorant: ValorantData | null };
type Subscription = { plan: string; status: string; current_period_end: string | null };
type ThemeName = "neon" | "classic" | "minimal";

const themes: Record<ThemeName, { label: string; shell: string; accent: string; pill: string }> = {
  neon: { label: "Neon gamer", shell: "border-cyan-400/30 bg-gradient-to-br from-cyan-950/70 via-slate-950 to-indigo-950/70", accent: "text-cyan-300", pill: "border-cyan-400/25 bg-cyan-400/10 text-cyan-100" },
  classic: { label: "Classic esports", shell: "border-amber-300/30 bg-gradient-to-br from-amber-950/50 via-slate-950 to-slate-900", accent: "text-amber-200", pill: "border-amber-300/25 bg-amber-300/10 text-amber-100" },
  minimal: { label: "Minimal professional", shell: "border-white/20 bg-slate-900", accent: "text-white", pill: "border-white/15 bg-white/5 text-slate-200" },
};

export default function PortfolioPage() {
  const [profile, setProfile] = useState<GamerProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [theme, setTheme] = useState<ThemeName>("neon");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !auth.user) {
        window.location.replace(`/login?next=${encodeURIComponent("/portfolio")}`);
        return;
      }
      const { data: sessionData } = await supabase.auth.getSession();
      let ownerAccess = false;
      if (sessionData.session?.access_token) {
        try {
          const ownerResponse = await fetch("/api/pro-access", {
            headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
            cache: "no-store",
          });
          const ownerResult = await ownerResponse.json().catch(() => ({}));
          ownerAccess = ownerResult.isOwner === true;
        } catch {
          ownerAccess = false;
        }
      }
      const [{ data: profileData, error: profileError }, { data: subscriptionData }] = await Promise.all([
        supabase.from("gamer_profiles").select("user_id,gamer_name,bio,country,selected_games,gaming_skills,avatar_style,valorant").eq("user_id", auth.user.id).maybeSingle(),
        supabase.from("gamer_subscriptions").select("plan,status,current_period_end").eq("user_id", auth.user.id).maybeSingle(),
      ]);
      if (!active) return;
      if (profileError) setError(`Could not load your profile: ${profileError.message}`);
      setIsOwner(ownerAccess);
      setProfile((profileData || null) as GamerProfile | null);
      setSubscription((subscriptionData || null) as Subscription | null);
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, []);

  const isPro = isOwner || (subscription?.plan === "pro" && subscription?.status === "active");
  const chosenTheme = themes[theme];

  if (loading) return <main className="min-h-screen bg-slate-950 p-8 text-white"><p className="mx-auto max-w-5xl text-slate-400">Loading your portfolio…</p></main>;

  if (error) return <main className="min-h-screen bg-slate-950 p-8 text-white"><div className="mx-auto max-w-3xl rounded-2xl border border-rose-300/20 p-6"><p role="alert">{error}</p><Link className="mt-4 inline-block text-cyan-300" href="/profile">Back to profile</Link></div></main>;

  if (!profile) return <main className="min-h-screen bg-slate-950 p-8 text-white"><div className="mx-auto max-w-3xl rounded-2xl border border-white/10 p-6"><h1 className="text-2xl font-bold">Complete your gamer profile first</h1><p className="mt-2 text-slate-400">Save your gamer name, games and skills before creating a portfolio.</p><Link className="mt-5 inline-block rounded-xl bg-cyan-400 px-4 py-3 font-bold text-slate-950" href="/profile">Open profile</Link></div></main>;

  const avatar = profile.avatar_style === "Neon Samurai" ? "⚔️" : profile.avatar_style === "Cosmic Wolf" ? "🐺" : "🥷";
  const games = Array.isArray(profile.selected_games) ? profile.selected_games : [];
  const skills = Array.isArray(profile.gaming_skills) ? profile.gaming_skills : [];
  const val = profile.valorant;

  return <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6">
    <style>{`@media print { @page { size: A4; margin: 14mm; } body { background: #fff !important; color: #111 !important; } .portfolio-print-card { background: #fff !important; color: #111 !important; border-color: #ddd !important; box-shadow: none !important; } .portfolio-print-card * { color: #111 !important; } .no-print { display: none !important; } }`}</style>
    <div className="mx-auto max-w-4xl">
      <header className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">GamerRP Pro Tool</p><h1 className="mt-2 text-3xl font-black">Gamer Portfolio</h1><p className="mt-1 text-sm text-slate-400">A clean portfolio to share with esports teams, organisers and collaborators.</p></div>
        <Link href="/profile" className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5">Back to profile</Link>
      </header>

      {!isPro && <section className="no-print mb-5 rounded-2xl border border-violet-300/25 bg-violet-300/[0.06] p-5">
        <p className="font-bold text-violet-200">Portfolio preview · Pro export is locked</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">You can preview your details here. The three premium layouts and PDF export unlock only after a verified active Pro subscription. Checkout may not be available until billing setup is complete; viewing this page never charges you.</p>
        <Link href="/pricing?upgrade=pro" className="mt-4 inline-block rounded-xl bg-violet-300 px-4 py-3 font-bold text-slate-950">View Pro plan</Link>
      </section>}

      <section className="no-print mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div><p className="font-semibold">Portfolio layout</p><p className="mt-1 text-xs text-slate-500">{isPro ? "Choose a style for your exported portfolio." : "Layout selection is a Pro feature."}</p></div>
        <select aria-label="Portfolio layout" value={theme} disabled={!isPro} onChange={(event) => setTheme(event.target.value as ThemeName)} className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm disabled:opacity-50">{(Object.keys(themes) as ThemeName[]).map((key) => <option key={key} value={key}>{themes[key].label}</option>)}</select>
        <button type="button" disabled={!isPro} onClick={() => window.print()} className="rounded-xl bg-cyan-400 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">Export / Save as PDF</button>
      </section>

      <article className={`portfolio-print-card overflow-hidden rounded-3xl border p-6 shadow-2xl sm:p-10 ${chosenTheme.shell}`}>
        <div className="flex flex-wrap items-start justify-between gap-5 border-b border-current/15 pb-7">
          <div className="flex min-w-0 items-center gap-4"><div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-current/20 bg-black/20 text-4xl">{avatar}</div><div className="min-w-0"><p className={`text-xs font-bold uppercase tracking-[0.22em] ${chosenTheme.accent}`}>GamerRP · Gamer portfolio</p><h2 className="mt-2 break-words text-3xl font-black sm:text-4xl">{profile.gamer_name || "Gamer"}</h2><p className="mt-2 text-sm opacity-75">{profile.country || "Country not added"}</p></div></div>
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${chosenTheme.pill}`}>{isPro ? "PRO PORTFOLIO" : "PORTFOLIO PREVIEW"}</span>
        </div>
        <section className="border-b border-current/15 py-6"><h3 className={`text-xs font-bold uppercase tracking-[0.18em] ${chosenTheme.accent}`}>About</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-7 opacity-90">{profile.bio || "Add a short bio in your GamerRP profile to tell teams about your playstyle and goals."}</p></section>
        <section className="border-b border-current/15 py-6"><div className="flex items-baseline justify-between gap-3"><h3 className={`text-xs font-bold uppercase tracking-[0.18em] ${chosenTheme.accent}`}>Games</h3><span className="text-xs opacity-60">{games.length} selected</span></div>{games.length ? <div className="mt-4 flex flex-wrap gap-2">{games.map((game) => <span key={game} className={`rounded-full border px-3 py-1.5 text-sm ${chosenTheme.pill}`}>{game}</span>)}</div> : <p className="mt-3 text-sm opacity-70">No games selected yet.</p>}</section>
        <section className="border-b border-current/15 py-6"><h3 className={`text-xs font-bold uppercase tracking-[0.18em] ${chosenTheme.accent}`}>Player skills</h3>{skills.length ? <div className="mt-4 flex flex-wrap gap-2">{skills.map((skill) => <span key={skill} className={`rounded-lg border px-3 py-2 text-sm ${chosenTheme.pill}`}>{skill}</span>)}</div> : <p className="mt-3 text-sm opacity-70">Add skills to your profile to showcase your strengths.</p>}</section>
        {val && <section className="py-6"><h3 className={`text-xs font-bold uppercase tracking-[0.18em] ${chosenTheme.accent}`}>Valorant experience</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{([{ label: "Current rank", value: val.currentRank }, { label: "Highest rank", value: val.highestRank }, { label: "Main role", value: val.role }, { label: "Experience", value: val.experience }, { label: "Competitive", value: val.competitive }] as { label: string; value: string | undefined }[]).filter((item) => Boolean(item.value)).map((item) => <div key={item.label} className="rounded-xl border border-current/15 bg-black/10 p-3"><p className="text-xs opacity-60">{item.label}</p><p className="mt-1 font-semibold">{item.value}</p></div>)}</div>{val.achievements && <div className="mt-4"><p className="text-xs opacity-60">Achievements</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{val.achievements}</p></div>}</section>}
        <footer className="border-t border-current/15 pt-5 text-xs opacity-60">Generated from the gamer’s saved GamerRP profile. Keep ranks and achievements accurate.</footer>
      </article>
      <div className="no-print mt-5 flex flex-wrap gap-3 text-sm"><Link href="/games" className="text-cyan-300 hover:text-cyan-200">Add more games →</Link><Link href="/pricing" className="text-cyan-300 hover:text-cyan-200">Pricing →</Link><Link href="/" className="text-slate-400 hover:text-white">Home</Link></div>
    </div>
  </main>;
}
