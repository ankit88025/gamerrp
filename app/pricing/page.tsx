"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Currency = "INR" | "USD" | "EUR" | "GBP" | "CAD" | "AUD";
type BillingInterval = "month" | "year";
type Subscription = { plan: string; status: string; current_period_end: string | null };

const pricePreview: Record<Currency, { label: string; symbol: string; month: string; year: string }> = {
  INR: { label: "India · INR", symbol: "₹", month: "149", year: "999" },
  USD: { label: "United States · USD", symbol: "$", month: "3.99", year: "29.99" },
  EUR: { label: "Euro area · EUR", symbol: "€", month: "3.69", year: "27.99" },
  GBP: { label: "United Kingdom · GBP", symbol: "£", month: "3.19", year: "24.99" },
  CAD: { label: "Canada · CAD", symbol: "CA$", month: "5.49", year: "39.99" },
  AUD: { label: "Australia · AUD", symbol: "A$", month: "5.99", year: "44.99" },
};

const freeFeatures = [
  "One account and a gamer profile",
  "Browse the game directory and add a missing game to your profile",
  "Ranks, skills, experience and achievements",
  "Free avatar presets and profile editing",
  "Core community, discover and teammate features",
];

const plannedProFeatures = [
  "Advanced profile themes and cover customization",
  "Pinned achievements and a richer shareable portfolio",
  "Profile-view and engagement analytics",
  "Downloadable portfolio card for teams and recruiters",
  "Additional showcase sections for clips and tournament results",
];

export default function PricingPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [currency, setCurrency] = useState<Currency>("INR");
  const [interval, setInterval] = useState<BillingInterval>("month");
  const [proCheckoutEnabled, setProCheckoutEnabled] = useState(false);
  const [mode, setMode] = useState("live");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [upgradeIntent, setUpgradeIntent] = useState(false);

  const loadSubscription = useCallback(async (id: string) => {
    setLoadingSubscription(true);
    const { data, error } = await supabase
      .from("gamer_subscriptions")
      .select("plan,status,current_period_end")
      .eq("user_id", id)
      .maybeSingle();
    if (!error && data) setSubscription(data as Subscription);
    else if (!data) setSubscription(null);
    if (error && error.code !== "PGRST116") {
      console.warn("Could not read GamerRP subscription status:", error.message);
    }
    setLoadingSubscription(false);
  }, []);

  const refreshBilling = useCallback(async () => {
    const res = await fetch("/api/billing/status", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    setProCheckoutEnabled(Boolean(data.proCheckoutEnabled));
    if (typeof data.mode === "string") setMode(data.mode);
  }, []);

  useEffect(() => {
    let active = true;
    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      setUserId(session?.user.id ?? null);
      setAccessToken(session?.access_token ?? null);
      setAuthChecked(true);
      if (session?.user.id) void loadSubscription(session.user.id);
    };
    void syncSession();
    void refreshBilling();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUserId(session?.user.id ?? null);
      setAccessToken(session?.access_token ?? null);
      setAuthChecked(true);
      if (session?.user.id) void loadSubscription(session.user.id);
      else setSubscription(null);
    });
    const params = new URLSearchParams(window.location.search);
    setUpgradeIntent(params.get("upgrade") === "pro");
    if (params.get("payment") === "return") {
      setMessage("Checkout returned to GamerRP. Pro will activate only after the provider webhook verifies the subscription. Refresh the status below if needed.");
    }

    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [loadSubscription, refreshBilling]);

  async function startCheckout() {
    setMessage("");
    if (!userId) {
      window.location.href = "/signup?plan=pro";
      return;
    }
    if (!proCheckoutEnabled) {
      setMessage("Pro checkout is not enabled yet. No payment has been taken; the Free plan is available now.");
      return;
    }
    if (!accessToken) {
      window.location.href = `/login?next=${encodeURIComponent("/pricing?upgrade=pro")}`;
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ interval }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || typeof result.url !== "string") {
        setMessage(result.error || "Checkout is not available. No payment has been taken.");
        setBusy(false);
        return;
      }
      window.location.assign(result.url);
    } catch {
      setMessage("Could not start secure checkout. No payment has been taken.");
      setBusy(false);
    }
  }

  const price = pricePreview[currency];
  const activePro = subscription?.plan === "pro" && subscription?.status === "active";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">GamerRP Plans</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">Start free. Upgrade when it is worth it.</h1>
          <p className="mt-5 leading-7 text-slate-400">One account for your profile, games, community and any future plan. Visit pricing anytime without registering again.</p>
        </header>

        {upgradeIntent && <p className="mb-6 rounded-xl border border-cyan-400/25 bg-cyan-400/5 p-4 text-sm text-cyan-100">You chose Pro while creating your account. You are already using the same GamerRP account; continue below when checkout is available. You will not be charged by viewing this page.</p>}
        {message && <p role="status" className="mb-6 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100">{message}</p>}

        <div className="mb-5 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row">
          <div>
            <p className="font-semibold">Preview regional price</p>
            <p className="mt-1 text-xs text-slate-500">These are proposed display examples, not active charges.</p>
          </div>
          <label className="flex items-center gap-3 text-sm text-slate-300">
            Currency
            <select value={currency} onChange={e => setCurrency(e.target.value as Currency)} className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-white">
              {(Object.keys(pricePreview) as Currency[]).map(code => <option key={code} value={code}>{pricePreview[code].label}</option>)}
            </select>
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="flex flex-col rounded-3xl border border-cyan-400/40 bg-cyan-400/[0.05] p-7 sm:p-9">
            <span className="w-fit rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-200">AVAILABLE NOW</span>
            <h2 className="mt-4 text-2xl font-bold">Free</h2>
            <p className="mt-2 text-sm text-slate-400">Everything needed to start building your gamer identity.</p>
            <p className="mt-6 text-5xl font-black">{pricePreview[currency].symbol}0 <span className="text-base font-medium text-slate-400">/ forever</span></p>
            <ul className="mt-7 flex-1 space-y-3 text-sm text-slate-300">{freeFeatures.map(feature => <li key={feature} className="flex gap-3"><span className="text-cyan-300">✓</span><span>{feature}</span></li>)}</ul>
            {authChecked && (userId
              ? <Link href="/profile" className="mt-8 rounded-xl bg-cyan-400 px-5 py-3 text-center font-bold text-slate-950 hover:bg-cyan-300">Open my profile</Link>
              : <div className="mt-8 space-y-3"><Link href="/signup?plan=free" className="block rounded-xl bg-cyan-400 px-5 py-3 text-center font-bold text-slate-950 hover:bg-cyan-300">Create free account</Link><Link href={`/login?next=${encodeURIComponent("/pricing")}`} className="block rounded-xl border border-white/15 px-5 py-3 text-center font-semibold">Already have an account? Log in</Link></div>)}
          </section>

          <section className="flex flex-col rounded-3xl border border-violet-300/25 bg-violet-300/[0.04] p-7 sm:p-9">
            <span className="w-fit rounded-full border border-amber-300/30 bg-amber-300/5 px-3 py-1 text-xs font-bold text-amber-200">{activePro ? "YOUR PLAN: PRO" : proCheckoutEnabled ? "PRO CHECKOUT AVAILABLE" : "PLANNED — NOT ON SALE"}</span>
            <h2 className="mt-4 text-2xl font-bold">GamerRP Pro</h2>
            <p className="mt-2 text-sm text-slate-400">Advanced presentation tools for players who want to share their gaming journey professionally.</p>
            <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Billing period">
              <button type="button" onClick={() => setInterval("month")} aria-pressed={interval === "month"} className={`rounded-lg px-3 py-2 text-sm ${interval === "month" ? "bg-violet-300 text-slate-950" : "border border-white/15 text-white"}`}>Monthly</button>
              <button type="button" onClick={() => setInterval("year")} aria-pressed={interval === "year"} className={`rounded-lg px-3 py-2 text-sm ${interval === "year" ? "bg-violet-300 text-slate-950" : "border border-white/15 text-white"}`}>Yearly</button>
            </div>
            <p className="mt-5 text-4xl font-black">{price.symbol}{interval === "month" ? price.month : price.year}<span className="text-base font-medium text-slate-400"> / {interval === "month" ? "month" : "year"}</span></p>
            <p className="mt-2 text-xs leading-5 text-slate-500">Indicative regional price only. When payments are enabled, Paddle checkout shows the final supported local price and applicable tax.</p>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-300">{plannedProFeatures.map(feature => <li key={feature} className="flex gap-3"><span className="text-violet-300">✦</span><span>{feature}</span></li>)}</ul>
            {activePro
              ? <div className="mt-8 rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-4 text-sm text-emerald-100">Your Pro subscription is active{subscription?.current_period_end ? ` until ${new Date(subscription.current_period_end).toLocaleDateString()}` : ""}.</div>
              : <button type="button" onClick={() => void startCheckout()} disabled={busy || (authChecked && userId !== null && !proCheckoutEnabled)} className="mt-8 rounded-xl bg-violet-300 px-5 py-3 text-center font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Opening secure checkout…" : proCheckoutEnabled ? "Continue to secure checkout" : userId ? "Pro checkout coming soon" : "Create account & choose Pro"}</button>}
            {!proCheckoutEnabled && <p className="mt-3 text-center text-xs leading-5 text-amber-100/75">No checkout or payment is active until Paddle approval, price IDs, webhook and the subscription database are fully configured. Choosing Pro never charges you by itself.</p>}
            {proCheckoutEnabled && mode === "sandbox" && <p className="mt-3 text-center text-xs text-amber-200">Sandbox mode: test transactions only, not live sales.</p>}
          </section>
        </div>

        {userId && <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 p-4"><div className="text-sm text-slate-400">{loadingSubscription ? "Checking subscription status…" : activePro ? "Pro access is verified by the billing webhook." : "You are on the Free plan unless a verified active Pro subscription is shown."}</div><button type="button" onClick={() => { void refreshBilling(); if (userId) void loadSubscription(userId); }} className="rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/5">Refresh status</button></div>}

        <p className="mt-8 text-center text-sm leading-6 text-slate-500">Pro features listed here are planned until implemented and tested. We will not charge for a feature that is not ready. Your existing account and saved games remain yours.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm"><Link href="/games" className="text-cyan-300 hover:text-cyan-200">Explore games →</Link><Link href="/profile" className="text-cyan-300 hover:text-cyan-200">My profile →</Link><Link href="/" className="text-slate-400 hover:text-white">Home</Link></div>
      </div>
    </main>
  );
}
