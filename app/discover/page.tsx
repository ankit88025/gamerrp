"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Gamer = { user_id: string; gamer_name: string | null; bio: string | null; country: string | null; selected_games: string[] | null; gaming_skills: string[] | null; avatar_style: string | null };
const inputClass = "w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400";

export default function DiscoverPage() {
  const [gamers, setGamers] = useState<Gamer[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [userId, setUserId] = useState("");
  const [search, setSearch] = useState("");
  const [gameFilter, setGameFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    const currentUserId = auth.user?.id || "";
    setUserId(currentUserId);

    const { data: profileRows, error: profileError } = await supabase
      .from("gamer_profiles")
      .select("user_id,gamer_name,bio,country,selected_games,gaming_skills,avatar_style")
      .order("updated_at", { ascending: false })
      .limit(100);

    let followRows: { following_id: string }[] = [];
    let followError: { message: string } | null = null;

    if (currentUserId) {
      const result = await supabase
        .from("gamer_follows")
        .select("following_id")
        .eq("follower_id", currentUserId);
      followRows = result.data || [];
      followError = result.error;
    }

    if (profileError || followError) {
      setMessage(`Could not load gamers: ${(profileError || followError)?.message || "Unknown error"}. Check SUPABASE_SETUP.sql.`);
    } else {
      setGamers(((profileRows || []) as Gamer[]).filter((g) => !currentUserId || g.user_id !== currentUserId));
      setFollowing(followRows.map((f) => f.following_id));
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function toggleFollow(gamerId: string) {
    if (!userId) {
      window.location.href = "/login";
      return;
    }
    const isFollowing = following.includes(gamerId);
    const result = isFollowing
      ? await supabase.from("gamer_follows").delete().eq("follower_id", userId).eq("following_id", gamerId)
      : await supabase.from("gamer_follows").insert({ follower_id: userId, following_id: gamerId });
    if (result.error) { setMessage(result.error.message); return; }
    setFollowing((current) => isFollowing ? current.filter((id) => id !== gamerId) : [...current, gamerId]);
  }

  const filtered = gamers.filter((g) => {
    const text = `${g.gamer_name || ""} ${g.bio || ""} ${g.country || ""} ${(g.gaming_skills || []).join(" ")}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (!gameFilter || (g.selected_games || []).some((game) => game.toLowerCase().includes(gameFilter.toLowerCase())));
  });

  return <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6">
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="text-2xl font-black">Gamer<span className="text-cyan-400">RP</span></Link>
        <nav className="flex flex-wrap gap-2 text-sm"><Link href="/feed" className="rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5">Feed</Link><Link href="/games" className="rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5">Games</Link><Link href="/profile" className="rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5">My profile</Link></nav>
      </header>
      <section className="mb-8 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-slate-900 p-7 sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">Gamer network</p>
        <h1 className="mt-3 text-3xl font-black sm:text-5xl">Find your next teammate.</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-400">Discover players by gamer name, skills, country, or the games they play. Follow gamers to build your professional network.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, skill, country…" className={inputClass}/>
          <input value={gameFilter} onChange={(e) => setGameFilter(e.target.value)} placeholder="Filter by game (e.g. Valorant)" className={inputClass}/>
        </div>
      </section>
      {message && <p role="alert" className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-200">{message}</p>}
      {loading ? <p className="py-10 text-center text-slate-400">Finding gamers…</p> : filtered.length === 0 ? <div className="rounded-2xl border border-white/10 p-10 text-center"><p className="text-xl font-bold">No gamers found yet</p><p className="mt-2 text-slate-400">Invite a friend to create a GamerRP profile, then they can appear here.</p><Link href="/profile" className="mt-5 inline-block rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950">Complete my profile</Link></div> :
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((gamer) => <article key={gamer.user_id} className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <div className="flex items-start gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-2xl">🎮</div><div className="min-w-0 flex-1"><h2 className="break-words text-lg font-bold">{gamer.gamer_name || "Gamer"}</h2><p className="text-sm text-slate-500">{gamer.country || "Location not added"}</p></div><button onClick={() => void toggleFollow(gamer.user_id)} className={following.includes(gamer.user_id) ? "rounded-lg border border-white/15 px-3 py-2 text-sm" : "rounded-lg bg-cyan-400 px-3 py-2 text-sm font-bold text-slate-950"}>{following.includes(gamer.user_id) ? "Following" : "+ Follow"}</button></div>
        <p className="mt-4 line-clamp-3 min-h-12 text-sm leading-6 text-slate-300">{gamer.bio || "This gamer is building their profile."}</p>
        {!!(gamer.selected_games || []).length && <div className="mt-4"><p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Games</p><div className="flex flex-wrap gap-2">{(gamer.selected_games || []).slice(0, 5).map((game) => <span key={game} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{game}</span>)}</div></div>}
        {!!(gamer.gaming_skills || []).length && <div className="mt-3"><p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Skills</p><div className="flex flex-wrap gap-2">{(gamer.gaming_skills || []).slice(0, 4).map((skill) => <span key={skill} className="rounded-full border border-cyan-400/20 px-3 py-1 text-xs text-cyan-200">{skill}</span>)}</div></div>}
      </article>)}</div>}
    </div>
  </main>;
}
