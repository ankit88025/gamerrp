"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type PlanChoice = "free" | "pro";

function safePath(path: string | null, fallback: string) {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return fallback;
  if (path === "/login" || path === "/signup") return fallback;
  return path;
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState<PlanChoice>("free");
  const [nextPath, setNextPath] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [confirmationHref, setConfirmationHref] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("plan") === "pro") setPlan("pro");
    setNextPath(params.get("next"));
  }, []);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setConfirmationHref("");

    const returnPath = safePath(nextPath, plan === "pro" ? "/pricing?upgrade=pro" : "/profile");
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { gamer_name: name.trim(), requested_plan: plan } },
    });
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.session) {
      window.location.replace(returnPath);
      return;
    }

    setMessage("Account created. Confirm your email, then log in to continue with the same account. No second signup is needed.");
    setConfirmationHref(`/login?next=${encodeURIComponent(returnPath)}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-10 text-white">
      <form onSubmit={handleSignup} className="w-full max-w-xl space-y-5 rounded-2xl border border-white/10 bg-slate-900 p-7 sm:p-8">
        <Link href="/" className="text-2xl font-bold">Gamer<span className="text-cyan-400">RP</span></Link>
        <h1 className="text-3xl font-bold">Create your GamerRP account</h1>
        <p className="text-slate-400">One account for your profile, games, community and any future plan.</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => setPlan("free")} aria-pressed={plan === "free"} className={`rounded-xl border p-4 text-left ${plan === "free" ? "border-cyan-400 bg-cyan-400/10" : "border-white/10 bg-slate-950"}`}>
            <span className="block font-bold">Free · ₹0</span>
            <span className="mt-1 block text-sm text-slate-400">Build your profile and use the core community.</span>
            <span className="mt-3 block text-sm text-cyan-300">{plan === "free" ? "✓ Selected" : "Choose Free"}</span>
          </button>
          <button type="button" onClick={() => setPlan("pro")} aria-pressed={plan === "pro"} className={`rounded-xl border p-4 text-left ${plan === "pro" ? "border-violet-400 bg-violet-400/10" : "border-white/10 bg-slate-950"}`}>
            <span className="block font-bold">GamerRP Pro · planned</span>
            <span className="mt-1 block text-sm text-slate-400">Express interest in future advanced portfolio tools.</span>
            <span className="mt-3 block text-sm text-violet-300">{plan === "pro" ? "✓ Selected — checkout later" : "Choose Pro"}</span>
          </button>
        </div>
        {plan === "pro" && <p className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-sm text-amber-100">Pro is not on sale until secure payments and Pro features are ready. Choosing Pro does not charge you. Your account is created only once.</p>}

        <label className="block text-sm">Gamer name
          <input required minLength={2} maxLength={40} autoComplete="nickname" value={name} onChange={e => setName(e.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-slate-950 p-3" />
        </label>
        <label className="block text-sm">Email
          <input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-slate-950 p-3" />
        </label>
        <label className="block text-sm">Password (at least 8 characters)
          <input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-slate-950 p-3" />
        </label>
        {message && <p role="status" className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-3 text-sm text-cyan-200">{message}</p>}
        {confirmationHref && <Link href={confirmationHref} className="block rounded-lg border border-cyan-400/30 p-3 text-center font-semibold text-cyan-200">Email confirmed? Log in and continue →</Link>}
        <button disabled={loading} className="w-full rounded-lg bg-cyan-400 p-3 font-semibold text-slate-950 disabled:opacity-60">{loading ? "Creating account…" : plan === "pro" ? "Create account & continue to Pro" : "Create free account"}</button>
        <p className="text-sm text-slate-400">Already registered? <Link href={`/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`} className="text-cyan-400">Log in — no need to register again</Link></p>
      </form>
    </main>
  );
}
