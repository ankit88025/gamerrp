"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const games = [
  "Valorant",
  "Counter-Strike 2",
  "BGMI",
  "PUBG",
  "Fortnite",
  "Minecraft",
  "GTA V",
  "Apex Legends",
  "Call of Duty",
  "League of Legends",
];

export default function Games() {
  const [search, setSearch] = useState("");
  const [selectedGames, setSelectedGames] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    async function loadGames() {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (!active) return;

      if (authError || !authData.user) {
        window.location.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("gamer_profiles")
        .select("selected_games")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error("Games load failed:", error.message);
        alert("Could not load your games. Please refresh and try again.");
        return;
      }

      setSelectedGames(
        data && Array.isArray(data.selected_games) ? data.selected_games : []
      );
    }

    void loadGames();

    return () => {
      active = false;
    };
  }, []);

  async function toggleGame(game: string) {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      window.location.replace("/login");
      return;
    }

    const updatedGames = selectedGames.includes(game)
      ? selectedGames.filter((item) => item !== game)
      : [...selectedGames, game];

    const { error } = await supabase
      .from("gamer_profiles")
      .upsert(
        {
          user_id: authData.user.id,
          selected_games: updatedGames,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("Games save failed:", error.message);
      alert("Games could not be saved: " + error.message);
      return;
    }

    setSelectedGames(updatedGames);
  }

  const filteredGames = games.filter((game) =>
    game.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">

        <div className="mb-10">
          <p className="text-sm font-medium text-cyan-400">
            GamerRP
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            What games do you play?
          </h1>

          <p className="mt-3 text-slate-400">
            Select the games you have experience with.
          </p>
        </div>

        <div className="mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search games..."
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-5 py-4 outline-none placeholder:text-slate-500 focus:border-cyan-400"
          />
        </div>

        {selectedGames.length > 0 && (
          <div className="mb-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6">
            <p className="text-sm text-cyan-400">
              Your Games
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {selectedGames.map((game) => (
                <span
                  key={game}
                  className="rounded-full bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300"
                >
                  🎮 {game}
                </span>
              ))}
            </div>
          </div>
        )}

        {filteredGames.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <p className="text-lg font-semibold">
              No games found
            </p>

            <p className="mt-2 text-slate-500">
              Try searching for another game.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGames.map((game) => {

              if (game === "Valorant") {
                return (
                  <Link
                    key={game}
                    href="/games/valorant"
                    className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left transition hover:border-cyan-400/50 hover:bg-cyan-400/5"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-2xl">
                      🎮
                    </div>

                    <h2 className="font-semibold">
                      {game}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Add your experience
                    </p>
                  </Link>
                );
              }

              const added = selectedGames.includes(game);

              return (
                <button
                  key={game}
                  type="button"
                  onClick={() => toggleGame(game)}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left transition hover:border-cyan-400/50 hover:bg-cyan-400/5"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-2xl">
                    🎮
                  </div>

                  <h2 className="font-semibold">
                    {game}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {added ? "✓ Added to your games" : "Add to your games"}
                  </p>
                </button>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
