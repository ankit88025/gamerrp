"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Opportunity = { id: string; user_id: string; title: string; kind: string; game: string; description: string; location: string | null; created_at: string; gamer_name?: string };
const field = "w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400";

export default function OpportunitiesPage() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("Looking for teammates");
  const [game, setGame] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) { window.location.replace("/login"); return; }
    setUserId(auth.user.id);
    const { data, error } = await supabase.from("gamer_opportunities").select("id,user_id,title,kind,game,description,location,created_at").order("created_at", { ascending: false }).limit(100);
    if (error) {
      setMessage(`Opportunities setup needed: ${error.message}. Run SUPABASE_SETUP.sql.`);
      setLoading(false);
      return;
    }
    const rows = (data || []) as Opportunity[];
    const ids = [...new Set(rows.map((row) => row.user_id))];
    const { data: profiles } = ids.length ? await supabase.from("gamer_profiles").select("user_id,gamer_name").in("user_id", ids) : { data: [] };
    const names = new Map<string, string>((profiles || []).map((p) => [p.user_id, p.gamer_name || "Gamer"] as [string, string]));
    setItems(rows.map((row) => ({ ...row, gamer_name: names.get(row.user_id) || "Gamer" })));
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function publish(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || !game.trim() || !description.trim()) return;
    setBusy(true); setMessage("");
    const { error } = await supabase.from("gamer_opportunities").insert({ user_id: userId, title: title.trim(), kind, game: game.trim(), description: description.trim(), location: location.trim() || null });
    setBusy(false);
    if (error) { setMessage(error.message); return; }
    setTitle(""); setGame(""); setDescription(""); setLocation("");
    await load();
  }

  const shown = filter === "All" ? items : items.filter((item) => item.kind === filter);

  return <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6"><div className="mx-auto max-w-6xl">
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4"><Link href="/" className="text-2xl font-black">Gamer<span className="text-cyan-400">RP</span></Link><nav className="flex flex-wrap gap-2 text-sm"><Link href="/feed" className="rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5">Feed</Link><Link href="/discover" className="rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5">Discover gamers</Link><Link href="/profile" className="rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5">My profile</Link></nav></header>
    <section className="mb-8 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-slate-900 p-7 sm:p-10"><p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">Level up together</p><h1 className="mt-3 text-3xl font-black sm:text-5xl">Gaming opportunities.</h1><p className="mt-3 max-w-2xl leading-7 text-slate-400">Find teammates, scrim partners, tournament squads, coaching, and recruitment opportunities.</p></section>
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <form onSubmit={publish} className="h-fit space-y-4 rounded-2xl border border-white/10 bg-slate-900/70 p-5"><h2 className="text-xl font-bold">Post an opportunity</h2><label className="block text-sm text-slate-300">Title<input required maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Looking for ranked teammates" className={`${field} mt-2`}/></label><label className="block text-sm text-slate-300">Opportunity type<select value={kind} onChange={(e) => setKind(e.target.value)} className={`${field} mt-2`}><option>Looking for teammates</option><option>Team recruitment</option><option>Tournament squad</option><option>Coaching</option><option>Scrim partner</option><option>Creator collaboration</option></select></label><label className="block text-sm text-slate-300">Game<input required maxLength={80} value={game} onChange={(e) => setGame(e.target.value)} placeholder="e.g. Valorant" className={`${field} mt-2`}/></label><label className="block text-sm text-slate-300">Location / region (optional)<input maxLength={100} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. India / Europe / Remote" className={`${field} mt-2`}/></label><label className="block text-sm text-slate-300">Details<textarea required maxLength={1500} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell gamers what you're looking for…" className={`${field} mt-2`}/></label>{message && <p role="alert" className="text-sm text-amber-300">{message}</p>}<button disabled={busy} className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-bold text-slate-950 disabled:opacity-50">{busy ? "Publishing…" : "Publish opportunity"}</button></form>
      <section><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">Community board <span className="text-sm font-normal text-slate-500">({shown.length})</span></h2><select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm"><option>All</option><option>Looking for teammates</option><option>Team recruitment</option><option>Tournament squad</option><option>Coaching</option><option>Scrim partner</option><option>Creator collaboration</option></select></div>
        {loading ? <p className="py-8 text-slate-400">Loading opportunities…</p> : shown.length === 0 ? <div className="rounded-2xl border border-white/10 p-8 text-center"><p className="font-bold">No opportunities posted yet</p><p className="mt-2 text-sm text-slate-400">Be the first to share what your team needs.</p></div> : <div className="space-y-4">{shown.map((item) => <article key={item.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">{item.kind}</span><h3 className="mt-3 text-lg font-bold">{item.title}</h3><p className="mt-1 text-sm text-slate-400">{item.game}{item.location ? ` · ${item.location}` : ""}</p></div><span className="text-xs text-slate-500">{new Date(item.created_at).toLocaleDateString()}</span></div><p className="mt-4 whitespace-pre-wrap leading-7 text-slate-300">{item.description}</p><div className="mt-4 border-t border-white/10 pt-3 text-sm text-slate-400">Posted by <span className="font-semibold text-white">{item.gamer_name}</span>{item.user_id === userId ? <span className="ml-2 text-cyan-300">· Your post</span> : null}</div></article>)}</div>}
      </section>
    </div>
  </div></main>;
}
