import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifyPaddleSignature(rawBody: string, header: string, secret: string): boolean {
  const values = new Map<string, string[]>();
  for (const part of header.split(";")) {
    const [key, value] = part.trim().split("=", 2);
    if (key && value) values.set(key, [...(values.get(key) || []), value]);
  }
  const timestamp = values.get("ts")?.[0];
  const signatures = values.get("h1") || [];
  if (!timestamp || signatures.length === 0) return false;
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds) || Math.abs(Date.now() / 1000 - seconds) > 300) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}:${rawBody}`).digest();
  return signatures.some((signature) => {
    if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
    const provided = Buffer.from(signature, "hex");
    return provided.length === expected.length && timingSafeEqual(provided, expected);
  });
}

type PaddleSubscription = {
  id?: string;
  status?: string;
  customer_id?: string | null;
  custom_data?: { user_id?: string; plan?: string } | null;
  current_billing_period?: { ends_at?: string | null } | null;
};

const SUPPORTED_EVENTS = new Set([
  "subscription.activated",
  "subscription.updated",
  "subscription.resumed",
  "subscription.paused",
  "subscription.past_due",
  "subscription.canceled",
]);

export async function POST(request: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!secret || !serviceKey || !supabaseUrl) {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("paddle-signature") || "";
  if (!verifyPaddleSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let event: { event_type?: string; data?: PaddleSubscription };
  try {
    event = JSON.parse(rawBody) as { event_type?: string; data?: PaddleSubscription };
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!event.event_type || !SUPPORTED_EVENTS.has(event.event_type)) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const subscription = event.data || {};
  const userId = subscription.custom_data?.user_id;
  if (!userId || !subscription.id || !subscription.status) {
    console.error("Paddle subscription event missing user_id, subscription id, or status.", event.event_type);
    return NextResponse.json({ received: true, ignored: true, reason: "Missing subscription association." });
  }

  const subscriptionStatus = ["active", "past_due", "paused", "canceled", "trialing"].includes(subscription.status)
    ? subscription.status
    : "inactive";
  const plan = subscription.status === "active" ? "pro" : "free";

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { error } = await admin.from("gamer_subscriptions").upsert({
    user_id: userId,
    plan,
    status: subscriptionStatus,
    paddle_customer_id: subscription.customer_id || null,
    paddle_subscription_id: subscription.id,
    current_period_end: subscription.current_billing_period?.ends_at || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });

  if (error) {
    console.error("Could not save subscription state:", error.message);
    return NextResponse.json({ error: "Subscription status could not be saved." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
