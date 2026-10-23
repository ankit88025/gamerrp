"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setMessage(error.message);
    window.location.href = "/feed";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
      <form onSubmit={handleLogin} className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-slate-900 p-8">
        <Link href="/" className="text-2xl font-bold">Gamer<span className="text-cyan-400">RP</span></Link>
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-slate-400">Log in to your gaming identity.</p>
        <label className="block text-sm">Email
          <input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-slate-950 p-3" />
        </label>
        <label className="block text-sm">Password
          <input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-slate-950 p-3" />
        </label>
        {message && <p role="alert" className="text-sm text-rose-400">{message}</p>}
        <button disabled={loading} className="w-full rounded-lg bg-cyan-400 p-3 font-semibold text-slate-950 disabled:opacity-60">{loading ? "Logging in..." : "Log in"}</button>
        <p className="text-sm text-slate-400">New to GamerRP? <Link href="/signup" className="text-cyan-400">Create an account</Link></p>
      </form>
    </main>
  );
}
