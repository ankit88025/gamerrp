"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  user_id: string;
  gamer_name: string | null;
  bio: string | null;
  country: string | null;
  selected_games: string[] | null;
  gaming_skills: string[] | null;
  avatar_style: string | null;
  valorant: {
    experience?: string;
    role?: string;
    currentRank?: string;
    highestRank?: string;
    competitive?: string;
    achievements?: string;
  } | null;
};

type Post = {
  id: string;
  body: string;
  image_url: string | null;
  created_at: string;
};

export default function GamerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      const { data: auth } = await supabase.auth.getUser();

      if (!active) return;

      if (!auth.user) {
        window.location.replace("/login");
        return;
      }

      setCurrentUserId(auth.user.id);

      const { data, error: profileError } = await supabase
        .from("gamer_profiles")
        .select("user_id,gamer_name,bio,country,selected_games,gaming_skills,avatar_style,valorant")
        .eq("user_id", id)
        .maybeSingle();

      if (!active) return;

      if (profileError || !data) {
        setError(profileError?.message || "Gamer profile not found.");
        setLoading(false);
        return;
      }

      setProfile(data as Profile);

      const { data: postRows, error: postError } = await supabase
        .from("gamer_posts")
        .select("id,body,image_url,created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!active) return;

      if (postError) {
        console.error("Profile posts error:", postError.message);
      }

      setPosts((postRows || []) as Post[]);
      setLoading(false);
    }

    if (id) void load();

    return () => {
      active = false;
    };
  }, [id]);

  const avatar = profile?.avatar_style === "Neon Samurai"
    ? "⚔️"
    : profile?.avatar_style === "Cosmic Wolf" ? "🐺" : "🥷";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex justify-between gap-3">
          <Link href="/discover" className="text-cyan-300">← Discover</Link>
          <Link href="/feed" className="text-cyan-300">Community Feed →</Link>
        </div>

        {loading ? (
          <p className="py-16 text-center text-slate-400">Loading profile...</p>
        ) : error ? (
          <p className="rounded-xl bg-slate-900 p-6 text-center text-rose-300">{error}</p>
        ) : profile ? (
          <>
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
              <div className="h-32 bg-gradient-to-r from-cyan-500/20 via-slate-900 to-blue-500/20" />

              <div className="px-5 pb-7 sm:px-8">
                <div className="-mt-10 flex items-end gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-slate-950 bg-cyan-500/20 text-4xl">
                    {avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">GamerRP Profile</p>
                    <h1 className="break-words text-2xl font-bold">{profile.gamer_name || "Gamer"}</h1>
                    <p className="text-sm text-slate-400">{profile.country || "Location not added"}</p>
                  </div>
                  {currentUserId && currentUserId !== profile.user_id && (
                    <Link
                      href={`/chat?user=${encodeURIComponent(profile.user_id)}`}
                      className="shrink-0 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-300"
                    >
                      Message
                    </Link>
                  )}
                </div>

                <p className="mt-6 whitespace-pre-wrap leading-7 text-slate-300">
                  {profile.bio || "No bio added yet."}
                </p>

                {!!profile.selected_games?.length && (
                  <div className="mt-6">
                    <h2 className="mb-3 font-bold">Games</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.selected_games.map(game => (
                        <span key={game} className="rounded-full bg-white/5 px-3 py-2 text-sm">
                          🎮 {game}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!!profile.gaming_skills?.length && (
                  <div className="mt-6">
                    <h2 className="mb-3 font-bold">Gaming Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.gaming_skills.map(skill => (
                        <span key={skill} className="rounded-full bg-cyan-400/10 px-3 py-2 text-sm text-cyan-200">
                          ✦ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.valorant && (
                  <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                    <h2 className="mb-4 text-lg font-bold">🎮 Valorant Experience</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        ["Experience", profile.valorant.experience],
                        ["Main Role", profile.valorant.role],
                        ["Current Rank", profile.valorant.currentRank],
                        ["Highest Rank", profile.valorant.highestRank],
                        ["Competitive", profile.valorant.competitive],
                      ].filter(item => item[1]).map(([label, value]) => (
                        <div key={label}>
                          <p className="text-xs text-slate-500">{label}</p>
                          <p className="mt-1 font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                    {profile.valorant.achievements && (
                      <p className="mt-4 whitespace-pre-wrap text-slate-300">
                        Achievements: {profile.valorant.achievements}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="mb-4 text-xl font-bold">Community Posts</h2>

              {!posts.length ? (
                <p className="rounded-xl border border-white/10 bg-slate-900 p-6 text-center text-slate-400">
                  No posts shared yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {posts.map(post => (
                    <article key={post.id} className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                      {post.body && (
                        <p className="whitespace-pre-wrap break-words leading-7">{post.body}</p>
                      )}
                      {post.image_url && (
                        <img
                          src={post.image_url}
                          alt="Gamer post"
                          loading="lazy"
                          className="mt-4 max-h-[560px] w-full rounded-xl object-contain"
                        />
                      )}
                      <p className="mt-4 text-xs text-slate-500">
                        {new Date(post.created_at).toLocaleString()}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
