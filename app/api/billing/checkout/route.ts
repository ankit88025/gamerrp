import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  if (process.env.GAMERRP_PRO_ENABLED !== "true") {
    return jsonError("GamerRP Pro checkout is not enabled yet. Your Free account remains available.", 503);
  }

  const paddleKey = process.env.PADDLE_API_KEY;
  const monthlyPrice = process.env.PADDLE_PRO_MONTHLY_PRICE_ID;
  const yearlyPrice = process.env.PADDLE_PRO_YEARLY_PRICE_ID;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!paddleKey || !monthlyPrice || !yearlyPrice || !supabaseUrl || !publishableKey || !siteUrl || !process.env.PADDLE_WEBHOOK_SECRET || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonError("Secure checkout is not configured completely yet. No payment was taken.", 503);
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return jsonError("Log in to the same GamerRP account before upgrading.", 401);

  let body: { interval?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }
  const interval = body.interval === "year" ? "year" : body.interval === "month" ? "month" : null;
  if (!interval) return jsonError("Choose monthly or yearly billing.", 400);

  const authClient = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) return jsonError("Your session expired. Log in again and retry.", 401);

  const admin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data: currentSubscription, error: subscriptionError } = await admin
    .from("gamer_subscriptions")
    .select("plan,status")
    .eq("user_id", authData.user.id)
    .maybeSingle();
  if (subscriptionError) return jsonError("Subscription database setup is incomplete. No payment was taken.", 503);
  if (currentSubscription?.plan === "pro" && currentSubscription?.status === "active") {
    return jsonError("Your GamerRP Pro subscription is already active.", 409);
  }

  const siteOrigin = siteUrl.replace(/\/$/, "");
  let checkoutReturnUrl: string | null = null;
  try {
    const parsed = new URL(siteOrigin);
    if (parsed.protocol === "https:") checkoutReturnUrl = `${parsed.origin}/pricing?payment=return`;
    else if (process.env.NODE_ENV !== "production" && parsed.hostname === "localhost") checkoutReturnUrl = null;
    else return jsonError("NEXT_PUBLIC_SITE_URL must be an approved HTTPS domain for live Paddle checkout.", 503);
  } catch {
    return jsonError("NEXT_PUBLIC_SITE_URL is invalid.", 503);
  }

  const apiBase = process.env.PADDLE_ENV === "sandbox" ? "https://sandbox-api.paddle.com" : "https://api.paddle.com";
  const priceId = interval === "year" ? yearlyPrice : monthlyPrice;

  try {
    const paddleResponse = await fetch(`${apiBase}/transactions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paddleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ price_id: priceId, quantity: 1 }],
        collection_mode: "automatic",
        enable_checkout: true,
        checkout: { url: checkoutReturnUrl },
        custom_data: {
          app: "GamerRP",
          user_id: authData.user.id,
          plan: "pro",
          billing_interval: interval,
        },
      }),
      cache: "no-store",
    });

    const result = await paddleResponse.json().catch(() => null);
    const checkoutUrl = result?.data?.checkout?.url;
    if (!paddleResponse.ok || typeof checkoutUrl !== "string" || !checkoutUrl.startsWith("https://")) {
      console.error("Paddle checkout creation failed:", result?.error?.detail || result?.error?.message || paddleResponse.status);
      return jsonError("Paddle could not create a checkout. Check the product/price IDs and approved checkout domain in your Paddle dashboard. No payment was taken.", 502);
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("Paddle checkout request failed:", error instanceof Error ? error.message : "unknown error");
    return jsonError("Could not contact the payment provider. No payment was taken.", 502);
  }
}
