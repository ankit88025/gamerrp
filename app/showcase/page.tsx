"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Item = {
  id: string;
  user_id: string;
  category: string;
  title: string;
  game_name: string;
  description: string | null;
  proof_url: string;
  created_at: string;
};

const field = "w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white";

export default function ShowcasePage() {
  const [userId, setUserId] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [category, setCategory] = useState("achievement");
  const [title, setTitle] = useState("");
  const [game, setGame] = useState("");
  const [description, setDescription] = useState("");
  const [proof, setProof] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.replace("/login?next=%2Fshowcase");
        return;
      }
      if (active) setUserId(auth.user.id);

      const { data, error } = await supabase
        .from("gamer_showcase_items")
        .select("id,user_id,category,title,game_name,description,proof_url,created_at")
        .order("created_at", { ascending: false });

      if (!active) return;
      if (error) setMessage("Database: " + error.message);
      else setItems((data || []) as Item[]);
    }
    void load();
    return () => { active = false; };
  }, []);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || !game.trim() || !userId) return;

    try {
      const parsed = new URL(proof);
      if (parsed.protocol !== "https:") throw new Error("Use a public HTTPS proof link.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Invalid proof link.");
      return;
    }

    setBusy(true);
    setMessage("");
    const { data, error } = await supabase
      .from("gamer_showcase_items")
      .insert({
        user_id: userId,
        category,
        title: title.trim(),
        game_name: game.trim(),
        description: description.trim(),
        proof_url: proof.trim()
      })
      .select("id,user_id,category,title,game_name,description,proof_url,created_at")
      .single();

    setBusy(false);
    if (error) { setMessage(error.message); return; }
    setItems((old) => [data as Item, ...old]);
    setTitle("");
    setGame("");
    setDescription("");
    setProof("");
    setMessage("Showcase item saved.");
  }

  async function remove(id: string) {
    const { error } = await supabase.from("gamer_showcase_items")
      .delete().eq("id", id).eq("user_id", userId);
    if (error) { setMessage(error.message); return; }
    setItems((old) => old.filter((item) => item.id !== id));
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-8 flex flex-wrap gap-4 text-sm text-cyan-300">
          <Link href="/feed">Feed</Link>
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/team-finder">Team Finder</Link>
          <Link href="/pricing">Pro plans</Link>
        </nav>
        <h1 className="text-3xl font-black sm:text-4xl">Achievement & Clip Showcase</h1>
        <p className="mt-2 text-slate-400">Show your achievements, tournament results and gameplay clips.</p>

        {message && <p role="status" className="my-4 rounded-xl border border-cyan-400/20 p-3 text-sm">{message}</p>}

        <div className="mt-6 grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
          <section className="space-y-4">
            {items.length === 0 && <p className="rounded-xl border border-white/10 p-6 text-slate-400">No showcase items yet. Add your first item.</p>}
            {items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <span className="text-xs font-bold uppercase text-cyan-300">{item.category}</span>
                <h2 className="mt-2 text-xl font-bold">{item.title}</h2>
                <p className="mt-1 text-sm text-violet-200">{item.game_name}</p>
                {item.description && <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{item.description}</p>}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <a href={item.proof_url} target="_blank" rel="noopener noreferrer" className="text-cyan-300">Open proof ↗</a>
                  {item.user_id === userId && <button onClick={() => void remove(item.id)} className="text-rose-300">Delete</button>}
                </div>
              </article>
            ))}
          </section>

          <form onSubmit={(e) => void save(e)} className="space-y-3 rounded-2xl border border-white/10 bg-slate-900 p-5">
            <h2 className="text-xl font-bold">Add showcase item</h2>
            <select className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="achievement">Achievement</option>
              <option value="tournament">Tournament result</option>
              <option value="clip">Gameplay clip</option>
            </select>
            <input className={field} required maxLength={90} placeholder="Achievement or clip title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className={field} required maxLength={80} placeholder="Game name" value={game} onChange={(e) => setGame(e.target.value)} />
            <textarea className={field} maxLength={500} rows={3} placeholder="Details (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <input className={field} required type="url" placeholder="https:// public proof link" value={proof} onChange={(e) => setProof(e.target.value)} />
            <button disabled={busy} className="w-full rounded-xl bg-cyan-400 p-3 font-bold text-slate-950 disabled:opacity-50">{busy ? "Saving…" : "Save item"}</button>
          </form>
        </div>
      </div>
    </main>
  );
}
