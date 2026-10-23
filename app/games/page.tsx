"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const games = [
  'Valorant',
  'Counter-Strike 2',
  'Counter-Strike: Global Offensive',
  'Dota 2',
  'League of Legends',
  'Teamfight Tactics',
  'Legends of Runeterra',
  'Wild Rift',
  'Overwatch 2',
  'Apex Legends',
  'Fortnite',
  'PUBG: Battlegrounds',
  'PUBG Mobile',
  'BGMI',
  'Call of Duty: Warzone',
  'Call of Duty: Modern Warfare III',
  'Call of Duty: Mobile',
  'Call of Duty: Black Ops 6',
  'Rainbow Six Siege',
  'The Finals',
  'Rocket League',
  "Tom Clancy's XDefiant",
  'Paladins',
  'Smite 2',
  'Marvel Rivals',
  'Deadlock',
  'Escape from Tarkov',
  'Arena Breakout',
  'Free Fire',
  'Free Fire MAX',
  'Standoff 2',
  'Critical Ops',
  'Blood Strike',
  'Delta Force',
  'War Thunder',
  'World of Tanks',
  'World of Warships',
  'Battlefield 2042',
  'Battlefield V',
  'Halo Infinite',
  'Destiny 2',
  'Warframe',
  'Genshin Impact',
  'Honkai: Star Rail',
  'Zenless Zone Zero',
  'Wuthering Waves',
  'Honkai Impact 3rd',
  'Tower of Fantasy',
  'Black Desert Online',
  'Final Fantasy XIV',
  'World of Warcraft',
  'The Elder Scrolls Online',
  'Guild Wars 2',
  'Lost Ark',
  'New World',
  'Path of Exile',
  'Path of Exile 2',
  'Diablo IV',
  'Diablo III',
  'Elden Ring',
  'Dark Souls III',
  'Monster Hunter: World',
  'Monster Hunter Rise',
  "Baldur's Gate 3",
  'The Witcher 3: Wild Hunt',
  'Cyberpunk 2077',
  'Red Dead Redemption 2',
  'Grand Theft Auto V',
  'Grand Theft Auto Online',
  'Minecraft',
  'Roblox',
  'Terraria',
  'Stardew Valley',
  'The Sims 4',
  'Palworld',
  'ARK: Survival Ascended',
  'Rust',
  'DayZ',
  'Valheim',
  "Don't Starve Together",
  'Project Zomboid',
  '7 Days to Die',
  'Among Us',
  'Fall Guys',
  'Party Animals',
  'Lethal Company',
  'Phasmophobia',
  'Content Warning',
  "Five Nights at Freddy's",
  'Dead by Daylight',
  'Identity V',
  'The Forest',
  'Sons of the Forest',
  'Left 4 Dead 2',
  'Back 4 Blood',
  'Helldivers 2',
  'Deep Rock Galactic',
  'Payday 3',
  'Sea of Thieves',
  "No Man's Sky",
  'Star Citizen',
  'Microsoft Flight Simulator',
  'Forza Horizon 5',
  'Forza Motorsport',
  'Gran Turismo 7',
  'Need for Speed Unbound',
  'The Crew Motorfest',
  'F1 25',
  'EA Sports FC 26',
  'eFootball',
  'NBA 2K26',
  'Madden NFL 26',
  'WWE 2K25',
  'Rocket League Sideswipe',
  'Clash of Clans',
  'Clash Royale',
  'Brawl Stars',
  'Mobile Legends: Bang Bang',
  'Honor of Kings',
  'Arena of Valor',
  'Pokémon Unite',
  'Pokémon GO',
  'Pokémon TCG Live',
  'Marvel Snap',
  'Hearthstone',
  'Magic: The Gathering Arena',
  'Teamfight Tactics Mobile',
  'Chess.com',
  'Lichess',
  'osu!',
  'Geometry Dash',
  'Trackmania',
  'Age of Empires IV',
  'Civilization VI',
  'Civilization VII',
  'StarCraft II',
  'Warcraft III: Reforged',
  'Company of Heroes 3',
  'Total War: Warhammer III',
  'The Binding of Isaac: Rebirth',
  'Hades II',
  'Hades',
  'Hollow Knight',
  'Hollow Knight: Silksong',
  'Celeste',
  'Cuphead',
  'Dead Cells',
  'Risk of Rain 2',
  'Vampire Survivors',
  'Slay the Spire',
  'Balatro',
  'Undertale',
  'Deltarune',
  'Persona 5 Royal',
  'Like a Dragon: Infinite Wealth',
  'Tekken 8',
  'Street Fighter 6',
  'Mortal Kombat 1',
  'Guilty Gear -Strive-',
  'Super Smash Bros. Ultimate',
  'Brawlhalla',
  'MultiVersus',
  'Fighting EX Layer',
  'It Takes Two',
  'Overcooked! 2',
  'Human: Fall Flat',
  'Golf With Your Friends',
  'Ultimate Chicken Horse',
  'Jackbox Party Pack',
  'Splitgate 2',
  'BattleBit Remastered',
  'Insurgency: Sandstorm',
  'Ready or Not',
  'Squad',
  'Hell Let Loose',
  'Arma 3',
  'Foxhole',
  'Chivalry 2',
  'Mordhau',
  'Mount & Blade II: Bannerlord',
  'Conan Exiles',
  'The Isle',
  'Jurassic World Evolution 2',
  'Cities: Skylines II',
  'Factorio',
  'Satisfactory',
  'Oxygen Not Included',
  'RimWorld',
  'Kerbal Space Program',
  'Euro Truck Simulator 2',
  'American Truck Simulator',
  'House Flipper 2',
  'PowerWash Simulator',
  'Palia',
  'Disney Dreamlight Valley',
  'Animal Crossing: New Horizons',
  'The Legend of Zelda: Tears of the Kingdom',
  'Super Mario Bros. Wonder',
  'Splatoon 3',
  'Mario Kart 8 Deluxe',
  'Metroid Dread',
  'Fire Emblem: Three Houses',
  'Final Fantasy VII Rebirth',
  'Kingdom Hearts III',
  'Resident Evil 4',
  'Silent Hill 2',
  'Alan Wake 2',
  'The Last of Us Part I',
  'God of War Ragnarök',
  "Marvel's Spider-Man 2",
  'Horizon Forbidden West',
  "Ghost of Tsushima Director's Cut",
  'Uncharted: Legacy of Thieves Collection',
  "Death Stranding Director's Cut",
  'Control',
  'Remnant II',
  'Lies of P',
  'Black Myth: Wukong',
  'Sekiro: Shadows Die Twice',
  'Naraka: Bladepoint',
  'Once Human',
  'The First Descendant',
  'Throne and Liberty',
  'Core Keeper',
  'Enshrouded',
  'Grounded',
  'Subnautica',
  'Dying Light 2 Stay Human',
  'The Division 2',
  'The Crew 2',
  'Trackmania Turbo',
  'Tetris Effect: Connected',
  'Puyo Puyo Tetris 2',
  'Peggle',
  'Plants vs. Zombies',
  'Plants vs. Zombies 2',
  'Bloons TD 6',
  'Mini Metro',
  'Mini Motorways',
  'Farming Simulator 25',
  'Football Manager 2024',
  'Out of the Park Baseball',
  'Super Auto Pets',
  'Legends of Idleon',
  'Cookie Clicker',
  'Idle Champions of the Forgotten Realms',
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
