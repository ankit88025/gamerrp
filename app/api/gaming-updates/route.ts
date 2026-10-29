import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SteamNewsItem = {
  gid: string;
  title: string;
  url: string;
  date: number;
  contents?: string;
  author?: string;
};

type GameSource = { name: string; appId: number; image: string };

const GAMES: GameSource[] = [
  { name: "Counter-Strike 2", appId: 730, image: "https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg" },
  { name: "Dota 2", appId: 570, image: "https://cdn.akamai.steamstatic.com/steam/apps/570/header.jpg" },
  { name: "PUBG: Battlegrounds", appId: 578080, image: "https://cdn.akamai.steamstatic.com/steam/apps/578080/header.jpg" },
  { name: "Apex Legends", appId: 1172470, image: "https://cdn.akamai.steamstatic.com/steam/apps/1172470/header.jpg" },
  { name: "Warframe", appId: 230410, image: "https://cdn.akamai.steamstatic.com/steam/apps/230410/header.jpg" },
  { name: "Team Fortress 2", appId: 440, image: "https://cdn.akamai.steamstatic.com/steam/apps/440/header.jpg" },
  { name: "Rust", appId: 252490, image: "https://cdn.akamai.steamstatic.com/steam/apps/252490/header.jpg" },
  { name: "Stardew Valley", appId: 413150, image: "https://cdn.akamai.steamstatic.com/steam/apps/413150/header.jpg" },
  { name: "Dead by Daylight", appId: 381210, image: "https://cdn.akamai.steamstatic.com/steam/apps/381210/header.jpg" },
  { name: "Euro Truck Simulator 2", appId: 227300, image: "https://cdn.akamai.steamstatic.com/steam/apps/227300/header.jpg" },
];

export async function GET() {
  const responses = await Promise.allSettled(
    GAMES.map(async (game) => {
      const url = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${game.appId}&count=4&maxlength=500`;
      const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(7000) });
      if (!response.ok) throw new Error(`Steam news unavailable for ${game.name}`);
      const json = await response.json();
      const items: SteamNewsItem[] = json?.appnews?.newsitems ?? [];
      return items.map((item) => ({
        id: `${game.appId}-${item.gid}`,
        game: game.name,
        title: item.title,
        url: item.url,
        date: item.date,
        summary: (item.contents || "Official game news and update details.").replace(/<[^>]*>/g, " ").replace(/\[.*?\]/g, " ").replace(/\s+/g, " ").trim().slice(0, 260),
        image: game.image,
        author: item.author || game.name,
      }));
    }),
  );

  const updates = responses.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  updates.sort((a, b) => b.date - a.date);
  return NextResponse.json({ updates: updates.slice(0, 30), fetchedAt: new Date().toISOString() }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
