"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Gamer = {
  user_id: string;
  gamer_name: string | null;
  country: string | null;
  selected_games: string[] | null;
  avatar_style?: string | null;
};
type ChatMessage = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
};

const field = "w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400";

export default function ChatPage() {
  const [userId, setUserId] = useState("");
  const [gamers, setGamers] = useState<Gamer[]>([]);
  const [selectedPeerId, setSelectedPeerId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadMessages = useCallback(async (me: string, peer: string) => {
    if (!me || !peer) return;
    setLoadingMessages(true);
    const { data, error: queryError } = await supabase
      .from("gamer_messages")
      .select("id,sender_id,recipient_id,body,created_at")
      .or(`and(sender_id.eq.${me},recipient_id.eq.${peer}),and(sender_id.eq.${peer},recipient_id.eq.${me})`)
      .order("created_at", { ascending: true })
      .limit(250);
    if (queryError) {
      setError(`Chat database setup needed: ${queryError.message}. Run SUPABASE_CHAT_SETUP.sql in Supabase SQL Editor.`);
      setLoadingMessages(false);
      return;
    }
    setMessages((data || []) as ChatMessage[]);
    setLoadingMessages(false);
  }, []);

  useEffect(() => {
    let active = true;
    async function initialize() {
      setError("");
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !authData.user) {
        window.location.replace(`/login?next=${encodeURIComponent("/chat")}`);
        return;
      }
      const me = authData.user.id;
      setUserId(me);
      const { data, error: peopleError } = await supabase
        .from("gamer_profiles")
        .select("user_id,gamer_name,country,selected_games,avatar_style")
        .order("updated_at", { ascending: false })
        .limit(300);
      if (!active) return;
      if (peopleError) {
        setError(`Could not load gamers: ${peopleError.message}`);
        setLoadingPeople(false);
        return;
      }
      const people = ((data || []) as Gamer[]).filter((person) => person.user_id !== me);
      setGamers(people);
      const requestedPeer = new URLSearchParams(window.location.search).get("user") || "";
      const chosen = people.find((person) => person.user_id === requestedPeer) || people[0];
      if (chosen) setSelectedPeerId(chosen.user_id);
      setLoadingPeople(false);
    }
    void initialize();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!userId || !selectedPeerId) {
      setMessages([]);
      return;
    }
    void loadMessages(userId, selectedPeerId);
    const channel = supabase
      .channel(`gamer-chat-${userId}-${selectedPeerId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "gamer_messages" }, () => {
        void loadMessages(userId, selectedPeerId);
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [userId, selectedPeerId, loadMessages]);

  const selectedGamer = gamers.find((gamer) => gamer.user_id === selectedPeerId) || null;
  const filteredGamers = useMemo(() => {
    const q = search.trim().toLowerCase().replace(/\s+/g, "");
    if (!q) return gamers;
    return gamers.filter((gamer) => {
      const haystack = `${gamer.gamer_name || ""} ${gamer.country || ""} ${(gamer.selected_games || []).join(" ")}`.toLowerCase();
      return haystack.includes(search.trim().toLowerCase()) || haystack.replace(/\s+/g, "").includes(q);
    });
  }, [gamers, search]);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !userId || !selectedPeerId || sending) return;
    if (body.length > 2000) {
      setError("Messages can be up to 2,000 characters.");
      return;
    }
    setSending(true);
    setError("");
    setNotice("");
    const { error: sendError } = await supabase.from("gamer_messages").insert({
      sender_id: userId,
      recipient_id: selectedPeerId,
      body,
    });
    setSending(false);
    if (sendError) {
      setError(`Message could not be sent: ${sendError.message}. Check SUPABASE_CHAT_SETUP.sql and your connection.`);
      return;
    }
    setDraft("");
    await loadMessages(userId, selectedPeerId);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-3 py-6 text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">GamerRP Community</p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">Messages</h1>
            <p className="mt-2 text-sm text-slate-400">Message other gamers directly from your GamerRP account.</p>
          </div>
          <Link href="/discover" className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5">Find gamers</Link>
        </header>

        {error && <p role="alert" className="mb-4 rounded-xl border border-rose-300/20 bg-rose-300/5 p-3 text-sm text-rose-100">{error}</p>}
        {notice && <p role="status" className="mb-4 rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-3 text-sm text-cyan-100">{notice}</p>}

        <div className="grid min-h-[65vh] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
            <div className="border-b border-white/10 p-4">
              <label htmlFor="gamer-search" className="mb-2 block text-sm font-medium text-slate-300">Find a gamer</label>
              <input id="gamer-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, country or game..." className={field} />
            </div>
            <div className="max-h-[65vh] overflow-y-auto">
              {loadingPeople ? <p className="p-5 text-sm text-slate-400">Loading gamers…</p> : filteredGamers.length === 0 ? <div className="p-5 text-sm text-slate-400">No gamers found yet. Finish a profile or invite a friend to join GamerRP.</div> : filteredGamers.map((gamer) => {
                const active = gamer.user_id === selectedPeerId;
                const avatar = gamer.avatar_style === "Neon Samurai" ? "⚔️" : gamer.avatar_style === "Cosmic Wolf" ? "🐺" : "🥷";
                return <button key={gamer.user_id} type="button" onClick={() => { setSelectedPeerId(gamer.user_id); setError(""); setNotice(""); }} className={`flex w-full items-start gap-3 border-b border-white/5 p-4 text-left transition ${active ? "bg-cyan-400/10" : "hover:bg-white/5"}`}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-xl">{avatar}</span>
                  <span className="min-w-0 flex-1"><span className={`block truncate font-semibold ${active ? "text-cyan-200" : "text-white"}`}>{gamer.gamer_name || "Gamer"}</span><span className="mt-1 block truncate text-xs text-slate-500">{gamer.country || "Location not added"}</span><span className="mt-1 block truncate text-xs text-slate-400">{(gamer.selected_games || []).slice(0, 3).join(" · ") || "Gaming profile"}</span></span>
                </button>;
              })}
            </div>
          </aside>

          <section className="flex min-h-[65vh] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50">
            {selectedGamer ? <>
              <header className="flex items-center justify-between gap-3 border-b border-white/10 p-4 sm:p-5">
                <div className="min-w-0"><h2 className="truncate text-lg font-bold">{selectedGamer.gamer_name || "Gamer"}</h2><p className="mt-1 text-xs text-slate-400">{selectedGamer.country || "GamerRP member"}</p></div>
                <Link href="/discover" className="shrink-0 text-sm text-cyan-300 hover:text-cyan-200">Discover</Link>
              </header>
              <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
                {loadingMessages ? <p className="text-sm text-slate-400">Loading conversation…</p> : messages.length === 0 ? <div className="flex min-h-48 flex-col items-center justify-center text-center"><span className="text-4xl">💬</span><p className="mt-3 font-semibold">Start the conversation</p><p className="mt-1 max-w-sm text-sm text-slate-400">Say hello, talk about games or find a teammate. Be respectful and do not share passwords or payment details.</p></div> : messages.map((message) => {
                  const mine = message.sender_id === userId;
                  return <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${mine ? "rounded-br-sm bg-cyan-400 text-slate-950" : "rounded-bl-sm border border-white/10 bg-slate-800 text-white"}`}><p className="whitespace-pre-wrap break-words text-sm leading-6">{message.body}</p><p className={`mt-1 text-right text-[10px] ${mine ? "text-slate-800/70" : "text-slate-400"}`}>{new Date(message.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p></div></div>;
                })}
              </div>
              <form onSubmit={sendMessage} className="border-t border-white/10 p-3 sm:p-4">
                <label htmlFor="message-draft" className="sr-only">Write a message</label>
                <div className="flex items-end gap-2"><textarea id="message-draft" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} rows={2} placeholder={`Message ${selectedGamer.gamer_name || "Gamer"}…`} className={`${field} min-h-12 resize-y`} /><button disabled={!draft.trim() || sending} className="rounded-xl bg-cyan-400 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">{sending ? "Sending…" : "Send"}</button></div>
                <p className="mt-2 text-xs text-slate-500">{draft.length}/2000 characters · Messages are visible to the two participants.</p>
              </form>
            </> : <div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><span className="text-5xl">💬</span><h2 className="mt-4 text-xl font-bold">Your gamer inbox</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-400">Choose a gamer on the left to open a private conversation. If nobody appears, ask another user to complete their GamerRP profile first.</p><Link href="/discover" className="mt-5 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">Discover gamers</Link></div>}
          </section>
        </div>
      </div>
    </main>
  );
}
