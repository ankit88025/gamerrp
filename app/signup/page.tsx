"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { gamer_name: name.trim() } },
    });
    setLoading(false);
    if (error) return setMessage(error.message);
    if (data.session) {
      window.location.href = "/profile";
    } else {
      setMessage("Account created! Check your email to confirm your account, then log in.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
      <form onSubmit={handleSignup} className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-slate-900 p-8">
        <Link href="/" className="text-2xl font-bold">Gamer<span className="text-cyan-400">RP</span></Link>
        <h1 className="text-3xl font-bold">Join GamerRP</h1>
        <p className="text-slate-400">Create your gaming identity.</p>
        <label className="block text-sm">Gamer name
          <input required minLength={2} maxLength={40} autoComplete="nickname" value={name} onChange={e => setName(e.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-slate-950 p-3" />
        </label>
        <label className="block text-sm">Email
          <input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-slate-950 p-3" />
        </label>
        <label className="block text-sm">Password (at least 8 characters)
          <input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-slate-950 p-3" />
        </label>
        {message && <p role="status" className="text-sm text-cyan-300">{message}</p>}
        <button disabled={loading} className="w-full rounded-lg bg-cyan-400 p-3 font-semibold text-slate-950 disabled:opacity-60">{loading ? "Creating account..." : "Create account"}</button>
        <p className="text-sm text-slate-400">Already registered? <Link href="/login" className="text-cyan-400">Log in</Link></p>
      </form>
    </main>
  );
}
