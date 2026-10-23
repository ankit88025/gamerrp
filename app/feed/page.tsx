"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type GamerProfile = { user_id: string; gamer_name: string | null; avatar_style?: string | null };
type Comment = { id: string; post_id: string; user_id: string; body: string; created_at: string; gamer_name?: string };
type Post = {
  id: string; user_id: string; body: string; created_at: string;
  gamer_name: string; avatar_style?: string | null; likes: number; liked: boolean;
  comments: Comment[];
};

const panel = "rounded-2xl border border-white/10 bg-slate-900/70";
const field = "w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400";

export default function FeedPage() {
  const [userId, setUserId] = useState("");
  const [draft, setDraft] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const loadFeed = useCallback(async () => {
    setLoading(true);
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) {
      window.location.replace("/login");
      return;
    }
    const currentUserId = auth.user.id;
    setUserId(currentUserId);

    const { data: postRows, error } = await supabase
      .from("gamer_posts").select("id,user_id,body,created_at")
      .order("created_at", { ascending: false }).limit(50);
    if (error) {
      setMessage(`Feed setup needed: ${error.message}. Run SUPABASE_SETUP.sql from the project package.`);
      setLoading(false);
      return;
    }

    const rows = postRows || [];
    const userIds = [...new Set(rows.map((p) => p.user_id))];
    const postIds = rows.map((p) => p.id);
    const [{ data: profileRows }, { data: likeRows }, { data: commentRows }] = await Promise.all([
      userIds.length ? supabase.from("gamer_profiles").select("user_id,gamer_name,avatar_style").in("user_id", userIds) : Promise.resolve({ data: [] }),
      postIds.length ? supabase.from("gamer_post_likes").select("post_id,user_id").in("post_id", postIds) : Promise.resolve({ data: [] }),
      postIds.length ? supabase.from("gamer_post_comments").select("id,post_id,user_id,body,created_at").in("post_id", postIds).order("created_at", { ascending: true }) : Promise.resolve({ data: [] }),
    ]);
    const profiles = new Map<string, GamerProfile>((profileRows || []).map((p) => [p.user_id, p] as [string, GamerProfile]));
    const likes = likeRows || [];
    const comments = (commentRows || []) as Comment[];
    const commentUserIds = [...new Set(comments.map((c) => c.user_id))];
    let commentProfiles: GamerProfile[] = [];
    if (commentUserIds.length) {
      const { data } = await supabase.from("gamer_profiles").select("user_id,gamer_name").in("user_id", commentUserIds);
      commentProfiles = (data || []) as GamerProfile[];
    }
    const commentNames = new Map<string, string>(commentProfiles.map((p) => [p.user_id, p.gamer_name || "Gamer"] as [string, string]));

    setPosts(rows.map((p) => {
      const profile = profiles.get(p.user_id);
      return {
        ...p,
        gamer_name: profile?.gamer_name || "Gamer",
        avatar_style: profile?.avatar_style,
        likes: likes.filter((l) => l.post_id === p.id).length,
        liked: likes.some((l) => l.post_id === p.id && l.user_id === currentUserId),
        comments: comments.filter((c) => c.post_id === p.id).map((c) => ({ ...c, gamer_name: commentNames.get(c.user_id) || "Gamer" })),
      };
    }));
    setLoading(false);
  }, []);

  useEffect(() => { void loadFeed(); }, [loadFeed]);

  async function createPost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.trim() || !userId) return;
    setBusy(true); setMessage("");
    const { error } = await supabase.from("gamer_posts").insert({ user_id: userId, body: draft.trim() });
    setBusy(false);
    if (error) { setMessage(error.message); return; }
    setDraft("");
    await loadFeed();
  }

  async function toggleLike(post: Post) {
    if (!userId) return;
    const { error } = post.liked
      ? await supabase.from("gamer_post_likes").delete().eq("post_id", post.id).eq("user_id", userId)
      : await supabase.from("gamer_post_likes").insert({ post_id: post.id, user_id: userId });
    if (error) { setMessage(error.message); return; }
    setPosts((current) => current.map((p) => p.id === post.id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p));
  }

  async function addComment(postId: string) {
    const body = (commentDrafts[postId] || "").trim();
    if (!body || !userId) return;
    const { error } = await supabase.from("gamer_post_comments").insert({ post_id: postId, user_id: userId, body });
    if (error) { setMessage(error.message); return; }
    setCommentDrafts((current) => ({ ...current, [postId]: "" }));
    await loadFeed();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Header />
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className={`${panel} h-fit p-4`}>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Your network</p>
            <SideLink href="/profile" label="My gamer profile" icon="👤" />
            <SideLink href="/discover" label="Discover gamers" icon="🌎" />
            <SideLink href="/games" label="Games directory" icon="🎮" />
            <SideLink href="/opportunities" label="Opportunities" icon="🏆" />
          </aside>
          <section className="space-y-5">
            <form onSubmit={createPost} className={`${panel} p-5`}>
              <p className="mb-3 font-semibold">Share your gaming journey</p>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={2000} rows={3} placeholder="Share a tournament result, a gaming milestone, a team win, or what you're learning..." className={field} />
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">{draft.length}/2000 characters</span>
                <button disabled={busy || !draft.trim()} className="rounded-xl bg-cyan-400 px-5 py-2.5 font-bold text-slate-950 disabled:opacity-50">{busy ? "Posting..." : "Publish post"}</button>
              </div>
              {message && <p role="alert" className="mt-3 text-sm text-amber-300">{message}</p>}
            </form>

            {loading ? <div className={`${panel} p-8 text-slate-400`}>Loading your gaming community…</div> : posts.length === 0 ? (
              <div className={`${panel} p-10 text-center`}>
                <div className="text-4xl">🎮</div><h2 className="mt-3 text-xl font-bold">Your feed starts here</h2>
                <p className="mt-2 text-slate-400">Share the first update or discover gamers to grow your network.</p>
              </div>
            ) : posts.map((post) => (
              <article key={post.id} className={`${panel} p-5`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-400/10 text-xl">🎮</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{post.gamer_name}</p>
                    <p className="text-xs text-slate-500">{new Date(post.created_at).toLocaleString()}</p>
                  </div>
                  <Link href="/discover" className="text-xs text-cyan-300 hover:text-cyan-200">Find gamers</Link>
                </div>
                <p className="my-5 whitespace-pre-wrap break-words leading-7 text-slate-200">{post.body}</p>
                <div className="flex items-center gap-4 border-y border-white/10 py-3 text-sm">
                  <button onClick={() => void toggleLike(post)} className={post.liked ? "font-semibold text-cyan-300" : "text-slate-300 hover:text-cyan-300"}>{post.liked ? "♥ Liked" : "♡ Like"} · {post.likes}</button>
                  <span className="text-slate-500">💬 {post.comments.length} comments</span>
                </div>
                <div className="mt-3 space-y-3">
                  {post.comments.map((comment) => <div key={comment.id} className="rounded-xl bg-slate-950/70 px-3 py-2"><p className="text-xs font-semibold text-cyan-300">{comment.gamer_name}</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{comment.body}</p></div>)}
                  <div className="flex gap-2">
                    <input value={commentDrafts[post.id] || ""} onChange={(e) => setCommentDrafts((current) => ({ ...current, [post.id]: e.target.value }))} maxLength={500} placeholder="Write a comment…" className={`${field} min-w-0`} />
                    <button onClick={() => void addComment(post.id)} disabled={!(commentDrafts[post.id] || "").trim()} className="rounded-xl border border-white/15 px-4 text-sm font-semibold hover:border-cyan-400 disabled:opacity-40">Reply</button>
                  </div>
                </div>
              </article>
            ))}
            <p className="text-center text-xs text-slate-600">Be respectful. Don’t share passwords, private information, or copyrighted game assets.</p>
          </section>
        </div>
      </div>
    </main>
  );
}

function Header() {
  return <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
    <Link href="/" className="text-2xl font-black tracking-tight">Gamer<span className="text-cyan-400">RP</span></Link>
    <nav className="flex flex-wrap gap-2 text-sm">
      <Link className="rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5" href="/feed">Feed</Link>
      <Link className="rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5" href="/discover">Discover</Link>
      <Link className="rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5" href="/opportunities">Opportunities</Link>
    </nav>
  </header>;
}

function SideLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return <Link href={href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-cyan-300"><span>{icon}</span>{label}</Link>;
}
