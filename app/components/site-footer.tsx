import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 px-5 py-8 text-sm text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/" className="text-lg font-bold text-white">Gamer<span className="text-cyan-400">RP</span></Link>
          <p className="mt-2 max-w-md">A professional network for gamers. Build your gaming identity, showcase achievements and discover opportunities.</p>
          <p className="mt-2">© {new Date().getFullYear()} GamerRP. All rights reserved.</p>
        </div>
        <nav aria-label="Legal and company links" className="flex flex-wrap gap-x-4 gap-y-2">
          <Link className="hover:text-white" href="/terms">Terms & Conditions</Link>
          <Link className="hover:text-white" href="/privacy">Privacy Policy</Link>
          <Link className="hover:text-white" href="/copyright">Copyright</Link>
          <Link className="hover:text-white" href="/partnerships">Founder & Partnerships</Link>
        </nav>
      </div>
      <p className="mx-auto mt-6 max-w-7xl text-xs leading-5 text-slate-500">Game titles, logos and third-party trademarks belong to their respective owners. GamerRP is an independent platform and does not imply affiliation with game publishers unless expressly stated.</p>
    </footer>
  );
}
