"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Post = {
  id: string;
  user_id: string;
  post_type: string;
  team_name: string | null;
  game_name: string;
  role: string;
  rank: string | null;
  region: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
};

const field = "w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white";

export default function TeamFinderPage() {
  const [userId, setUserId] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [type, setType] = useState("looking_for_team");
  const [title, setTitle] = useState("");
  const [team, setTeam] = useState("");
  const [game, setGame] = useState("");
  const [role, setRole] = useState("");
  const [rank, setRank] = useState("");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.replace("/login?next=%2Fteam-finder");
        return;
      }
      if (active) setUserId(auth.user.id);

      const { data, error } = await supabase.from("gamer_team_posts")
        .select("id,user_id,post_type,team_name,game_name,role,rank,region,title,description,status,created_at")
        .order("created_at", { ascending: false });

      if (!active) return;
      if (error) setMessage("Database: " + error.message);
      else setPosts((data || []) as Post[]);
    }
    void load();
    return () => { active = false; };
  }, []);

  const visible = posts.filter((p) =>
    p.status === "active" &&
    `${p.title} ${p.game_name} ${p.role} ${p.rank || ""} ${p.region} ${p.team_name || ""} ${p.description || ""}`
      .toLowerCase().includes(filter.toLowerCase())
  );

  async function publish(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId) return;
    setBusy(true);
    setMessage("");
    const { data, error } = await supabase.from("gamer_team_posts").insert({
      user_id: userId,
      post_type: type,
      team_name: type === "recruiting" ? team.trim() : "",
      game_name: game.trim(),
      role: role.trim(),
      rank: rank.trim(),
      region: region.trim(),
      title: title.trim(),
      description: description.trim(),
      status: "active"
    }).select("id,user_id,post_type,team_name,game_name,role,rank,region,title,description,status,created_at").single();

    setBusy(false);
    if (error) { setMessage(error.message); return; }
    setPosts((old) => [data as Post, ...old]);
    setTitle(""); setTeam(""); setGame(""); setRole(""); setRank(""); setRegion(""); setDescription("");
    setMessage("Team post published.");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-8 flex flex-wrap gap-4 text-sm text-cyan-300">
          <Link href="/feed">Feed</Link>
          <Link href="/showcase">Showcase</Link>
          <Link href="/chat">Chat</Link>
          <Link href="/opportunities">Opportunities</Link>
        </nav>
        <h1 className="text-3xl font-black sm:text-4xl">Team Finder</h1>
        <p className="mt-2 text-slate-400">Find teammates by game, role, rank and region.</p>
        {message && <p role="status" className="my-4 rounded-xl border border-cyan-400/20 p-3 text-sm">{message}</p>}

        <div className="mt-6 grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
          <section className="space-y-4">
            <input className={field} value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search game, role, rank or region…" />
            {visible.length === 0 && <p className="rounded-xl border border-white/10 p-6 text-slate-400">No matching posts yet.</p>}
            {visible.map((p) => (
              <article key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-bold uppercase text-cyan-300">{p.post_type === "recruiting" ? "Team recruiting" : "Player looking for team"}</p>
                <h2 className="mt-2 text-xl font-bold">{p.title}</h2>
                <p className="mt-1 text-sm text-violet-200">{p.game_name}{p.team_name ? ` · ${p.team_name}` : ""}</p>
                <p className="mt-2 text-sm text-slate-400">Role: {p.role} · Rank: {p.rank || "Any"} · Region: {p.region}</p>
                {p.description && <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{p.description}</p>}
                {p.user_id === userId && <p className="mt-3 text-xs text-cyan-300">Your post</p>}
                {p.user_id !== userId && <Link className="mt-4 inline-block text-sm text-cyan-300" href={`/chat?user=${encodeURIComponent(p.user_id)}`}>Message poster ↗</Link>}
              </article>
            ))}
          </section>

          <form onSubmit={(e) => void publish(e)} className="space-y-3 rounded-2xl border border-white/10 bg-slate-900 p-5">
            <h2 className="text-xl font-bold">Publish a team post</h2>
            <select className={field} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="looking_for_team">Player looking for team</option>
              <option value="recruiting">Team recruiting</option>
            </select>
            {type === "recruiting" && <input className={field} maxLength={100} placeholder="Team name" value={team} onChange={(e) => setTeam(e.target.value)} />}
            <input className={field} required maxLength={100} placeholder="Post title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className={field} required maxLength={80} placeholder="Game" value={game} onChange={(e) => setGame(e.target.value)} />
            <input className={field} required maxLength={60} placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} />
            <input className={field} maxLength={60} placeholder="Rank (optional)" value={rank} onChange={(e) => setRank(e.target.value)} />
            <input className={field} required maxLength={80} placeholder="Region" value={region} onChange={(e) => setRegion(e.target.value)} />
            <textarea className={field} rows={3} maxLength={700} placeholder="Details (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <button disabled={busy} className="w-full rounded-xl bg-cyan-400 p-3 font-bold text-slate-950 disabled:opacity-50">{busy ? "Publishing…" : "Publish post"}</button>
          </form>
        </div>
      </div>
    </main>
  );
}
