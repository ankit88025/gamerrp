"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type NotificationRow = {
  id: string;
  actor_id: string;
  recipient_id: string;
  type: "like" | "comment" | "follow";
  post_id: string | null;
  message: string;
  created_at: string;
  read_at: string | null;
};
type ProfileRow = { user_id: string; gamer_name: string | null };

const panel = "rounded-2xl border border-white/10 bg-slate-900/70";

export default function NotificationsPage() {
  const [userId, setUserId] = useState("");
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) {
      window.location.replace("/login?next=%2Fnotifications");
      return;
    }
    setUserId(auth.user.id);
    const { data, error: queryError } = await supabase
      .from("gamer_notifications")
      .select("id,actor_id,recipient_id,type,post_id,message,created_at,read_at")
      .eq("recipient_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (queryError) {
      setError(`Notifications setup needed: ${queryError.message}. Run SUPABASE_NOTIFICATIONS_SETUP.sql in Supabase SQL Editor.`);
      setItems([]);
      setLoading(false);
      return;
    }
    const rows = (data || []) as NotificationRow[];
    setItems(rows);
    const actorIds = [...new Set(rows.map((row) => row.actor_id))];
    if (actorIds.length) {
      const { data: profiles } = await supabase.from("gamer_profiles").select("user_id,gamer_name").in("user_id", actorIds);
      const nextNames: Record<string, string> = {};
      ((profiles || []) as ProfileRow[]).forEach((profile) => { nextNames[profile.user_id] = profile.gamer_name || "Gamer"; });
      setNames(nextNames);
    } else setNames({});
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function markRead(id: string) {
    if (!userId) return;
    const now = new Date().toISOString();
    const { error: updateError } = await supabase.from("gamer_notifications").update({ read_at: now }).eq("id", id).eq("recipient_id", userId);
    if (updateError) { setError(updateError.message); return; }
    setItems((current) => current.map((item) => item.id === id ? { ...item, read_at: now } : item));
  }

  async function markAllRead() {
    if (!userId || busy) return;
    setBusy(true);
    const now = new Date().toISOString();
    const { error: updateError } = await supabase.from("gamer_notifications").update({ read_at: now }).eq("recipient_id", userId).is("read_at", null);
    setBusy(false);
    if (updateError) { setError(updateError.message); return; }
    setItems((current) => current.map((item) => item.read_at ? item : { ...item, read_at: now }));
  }

  const unread = items.filter((item) => !item.read_at).length;
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div><Link href="/feed" className="text-2xl font-black tracking-tight">Gamer<span className="text-cyan-400">RP</span></Link><h1 className="mt-3 text-2xl font-bold">Notifications</h1><p className="mt-1 text-sm text-slate-400">Likes, comments and new followers in your gaming network.</p></div>
          <div className="flex gap-2"><Link href="/feed" className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:border-cyan-400">Feed</Link><Link href="/discover" className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:border-cyan-400">Discover</Link></div>
        </header>
        <section className={`${panel} p-4 sm:p-5`}>
          <div className="mb-4 flex items-center justify-between gap-3"><p className="font-semibold">Recent activity <span className="ml-1 text-sm text-cyan-300">{unread} unread</span></p><button onClick={() => void markAllRead()} disabled={busy || unread === 0} className="rounded-lg border border-white/15 px-3 py-2 text-sm text-cyan-200 disabled:opacity-40">{busy ? "Saving…" : "Mark all read"}</button></div>
          {error && <p role="alert" className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-sm text-amber-200">{error}</p>}
          {loading ? <p className="py-8 text-center text-slate-400">Loading notifications…</p> : items.length === 0 ? <div className="py-10 text-center"><div className="text-4xl">🔔</div><p className="mt-3 font-semibold">You’re all caught up</p><p className="mt-1 text-sm text-slate-400">Likes, comments and follows will show up here.</p><Link href="/discover" className="mt-4 inline-block rounded-xl bg-cyan-400 px-4 py-2.5 font-semibold text-slate-950">Discover gamers</Link></div> : <div className="space-y-2">{items.map((item) => {
            const href = item.type === "follow" ? "/discover" : "/feed";
            const icon = item.type === "like" ? "♥" : item.type === "comment" ? "💬" : "👤";
            return <div key={item.id} className={`flex items-start gap-3 rounded-xl border p-4 ${item.read_at ? "border-white/5 bg-slate-950/40" : "border-cyan-400/20 bg-cyan-400/5"}`}><span className="mt-0.5 text-xl" aria-hidden="true">{icon}</span><div className="min-w-0 flex-1"><p className="text-sm leading-6"><strong>{names[item.actor_id] || "Gamer"}</strong> {item.message}</p><p className="mt-1 text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p><div className="mt-2 flex gap-3 text-xs"><Link href={href} onClick={() => { if (!item.read_at) void markRead(item.id); }} className="text-cyan-300 hover:text-cyan-200">View activity</Link>{!item.read_at && <button onClick={() => void markRead(item.id)} className="text-slate-400 hover:text-white">Mark read</button>}</div></div>{!item.read_at && <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" aria-label="Unread" />}</div>;
          })}</div>}
        </section>
      </div>
    </main>
  );
}
