"use client";

import { useCallback, useEffect, useState } from "react";

type Update = { id: string; game: string; title: string; url: string; date: number; summary: string; image: string; author: string };
type Section = "Latest Updates" | "Popular Games" | "Upcoming Games";

const popular = [
  { name: "Counter-Strike 2", genre: "Competitive FPS", appId: 730 },
  { name: "PUBG: Battlegrounds", genre: "Battle royale", appId: 578080 },
  { name: "Dota 2", genre: "MOBA / esports", appId: 570 },
  { name: "Apex Legends", genre: "Hero shooter", appId: 1172470 },
  { name: "Warframe", genre: "Action RPG", appId: 230410 },
  { name: "Rust", genre: "Survival multiplayer", appId: 252490 },
  { name: "Stardew Valley", genre: "Cozy simulation", appId: 413150 },
  { name: "Dead by Daylight", genre: "Horror multiplayer", appId: 381210 },
  { name: "Team Fortress 2", genre: "Team shooter", appId: 440 },
  { name: "Euro Truck Simulator 2", genre: "Driving simulation", appId: 227300 },
  { name: "Baldur's Gate 3", genre: "Fantasy RPG", appId: 1086940 },
  { name: "Cyberpunk 2077", genre: "Open-world RPG", appId: 1091500 },
];

// Dates are based on published release calendars checked 29 Oct 2026; always open the source to reconfirm.
const upcoming = [
  { name: "The Legend of Zelda: Ocarina of Time", date: "5 Nov 2026", platforms: "Nintendo Switch 2", image: "https://cdn.akamai.steamstatic.com/steam/apps/570/header.jpg", source: "https://www.videogameschronicle.com/guide/upcoming-game-release-dates-schedule/" },
  { name: "Grand Theft Auto VI", date: "19 Nov 2026", platforms: "PlayStation 5 · Xbox Series X|S", image: "https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg", source: "https://www.rockstargames.com/VI" },
  { name: "Warhammer 40,000: Dawn of War IV", date: "3 Dec 2026", platforms: "PC", image: "https://cdn.akamai.steamstatic.com/steam/apps/570/header.jpg", source: "https://gametechreport.com/calendar/" },
  { name: "Professor Layton and the New World of Steam", date: "10 Dec 2026", platforms: "Nintendo platforms · PC", image: "https://cdn.akamai.steamstatic.com/steam/apps/413150/header.jpg", source: "https://www.videogameschronicle.com/guide/upcoming-game-release-dates-schedule/" },
  { name: "Path of Exile II", date: "11 Dec 2026", platforms: "PC · PlayStation · Xbox", image: "https://cdn.akamai.steamstatic.com/steam/apps/2694490/header.jpg", source: "https://www.videogameschronicle.com/guide/upcoming-game-release-dates-schedule/" },
  { name: "Dragon Quest Monsters: The Withered World", date: "3 Dec 2026", platforms: "PC · PlayStation · Nintendo", image: "https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg", source: "https://www.videogameschronicle.com/guide/upcoming-game-release-dates-schedule/" },
];

const cover = (appId: number) => `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`;
const formatDate = (date: number) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(date * 1000));

export default function GamingDiscovery() {
  const [section, setSection] = useState<Section>("Latest Updates");
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const loadUpdates = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/gaming-updates", { cache: "no-store" });
      if (!response.ok) throw new Error("Gaming news is temporarily unavailable.");
      const data = await response.json();
      setUpdates(data.updates || []);
      setLastUpdated(data.fetchedAt || new Date().toISOString());
    } catch {
      setError("Live gaming news is temporarily unavailable. Popular games and upcoming releases are still shown.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadUpdates(); }, [loadUpdates]);

  const tabs: Section[] = ["Latest Updates", "Popular Games", "Upcoming Games"];
  return (
    <section className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-900/70 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">GamerRP Discover</p><h2 className="mt-1 text-xl font-black sm:text-2xl">Your gaming world, in one feed</h2><p className="mt-1 text-sm text-slate-400">Game highlights, official news and upcoming releases.</p></div>
        <button type="button" onClick={() => void loadUpdates()} disabled={loading} className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/5 disabled:opacity-50">{loading ? "Refreshing…" : "↻ Refresh news"}</button>
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => <button key={tab} type="button" onClick={() => setSection(tab)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${section === tab ? "bg-cyan-300 text-slate-950" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>{tab}</button>)}
      </div>

      {section === "Latest Updates" && <div className="mt-4">
        {loading && updates.length === 0 ? <p className="py-8 text-center text-sm text-slate-400">Loading official game updates…</p> : error && updates.length === 0 ? <p className="py-4 text-sm text-amber-200">{error}</p> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          {updates.map((item) => <article key={item.id} className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/70">
            <a href={item.url} target="_blank" rel="noreferrer" className="group block">
              <img src={item.image} alt={`${item.game} cover`} loading="lazy" className="h-28 w-full object-cover transition group-hover:opacity-90" />
              <div className="p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold text-cyan-300">{item.game}</span><span className="text-[11px] text-slate-500">{formatDate(item.date)}</span></div><h3 className="mt-2 font-bold leading-snug group-hover:text-cyan-200">{item.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{item.summary || "Open the official announcement for details."}</p><span className="mt-3 inline-block text-xs font-semibold text-cyan-300">Read source ↗</span></div>
            </a>
          </article>)}
        </div>
        {error && updates.length > 0 && <p className="mt-3 text-xs text-amber-200">Some sources did not respond; showing available results.</p>}
        {!loading && updates.length === 0 && !error && <p className="py-6 text-center text-sm text-slate-400">No updates returned right now. Try refreshing.</p>}
        {lastUpdated && <p className="mt-3 text-right text-[11px] text-slate-500">News checked {formatDate(Math.floor(new Date(lastUpdated).getTime() / 1000))} · via Steam news feeds</p>}
      </div>}

      {section === "Popular Games" && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {popular.map((game) => <a key={game.appId} href={`https://store.steampowered.com/app/${game.appId}/`} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-xl border border-white/10 bg-slate-950/70"><img src={cover(game.appId)} alt={`${game.name} cover`} loading="lazy" className="h-24 w-full object-cover transition group-hover:scale-[1.02]"/><div className="p-3"><h3 className="text-sm font-bold group-hover:text-cyan-200">{game.name}</h3><p className="mt-1 text-xs text-slate-500">{game.genre}</p><span className="mt-2 inline-block text-xs text-cyan-300">Explore game ↗</span></div></a>)}
      </div>}

      {section === "Upcoming Games" && <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {upcoming.map((game) => <article key={game.name} className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/70"><a href={game.source} target="_blank" rel="noreferrer" className="group block"><img src={game.image} alt={`${game.name} game artwork`} loading="lazy" className="h-32 w-full object-cover"/><div className="p-3"><span className="text-xs font-bold text-amber-300">UPCOMING · {game.date}</span><h3 className="mt-1 font-bold group-hover:text-cyan-200">{game.name}</h3><p className="mt-1 text-xs text-slate-400">{game.platforms}</p><span className="mt-3 inline-block text-xs text-cyan-300">Check release source ↗</span></div></a></article>)}
      </div>}
      <p className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-5 text-slate-500">Game artwork and announcements belong to their respective publishers/platforms. Release dates can change; verify from the linked source. GamerRP is not affiliated with these game publishers.</p>
    </section>
  );
}
