"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) { setUserId(data.user?.id ?? null); setAuthChecked(true); }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) { setUserId(session?.user?.id ?? null); setAuthChecked(true); }
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  if (pathname === "/login" || pathname === "/signup") return null;

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) { alert("Sign out failed: " + error.message); return; }
    setUserId(null);
    router.push("/");
    router.refresh();
  }

  const links = userId
    ? [
        { href: "/feed", label: "Feed" },
        { href: "/discover", label: "Discover" },
        { href: "/games", label: "Games" },
        { href: "/opportunities", label: "Opportunities" },
        { href: "/pricing", label: "Pricing" },
        { href: "/profile", label: "Profile" },
      ]
    : pathname === "/"
      ? [
          { href: "/discover", label: "Discover" },
          { href: "/games", label: "Games" },
          { href: "/feed", label: "Community Feed" },
          { href: "/opportunities", label: "Opportunities" },
          { href: "/pricing", label: "Pricing" },
        ]
      : [
          { href: "/discover", label: "Discover" },
          { href: "/games", label: "Games" },
          { href: "/pricing", label: "Pricing" },
        ];

  const loginHref = `/login?next=${encodeURIComponent(pathname || "/")}`;
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 text-white backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" aria-label="GamerRP Home" className="text-xl font-bold">Gamer<span className="text-cyan-400">RP</span></Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {links.map((link) => <Link key={link.href} href={link.href} className={pathname === link.href ? "font-semibold text-cyan-400" : "text-slate-300 hover:text-white"}>{link.label}</Link>)}
          {authChecked && (userId
            ? <button onClick={handleSignOut} className="text-rose-300 hover:text-rose-200">Sign Out</button>
            : <><Link href={loginHref} className="text-cyan-400">Log in</Link>{pathname === "/" && <Link href="/signup" className="rounded-lg bg-cyan-400 px-3 py-2 font-semibold text-slate-950">Join GamerRP</Link>}</>)}
        </div>
      </nav>
    </header>
  );
}
