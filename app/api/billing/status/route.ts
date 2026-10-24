import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const configured = Boolean(
    process.env.GAMERRP_PRO_ENABLED === "true" &&
    process.env.PADDLE_API_KEY &&
    process.env.PADDLE_WEBHOOK_SECRET &&
    process.env.PADDLE_PRO_MONTHLY_PRICE_ID &&
    process.env.PADDLE_PRO_YEARLY_PRICE_ID &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.NEXT_PUBLIC_SITE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );

  let databaseReady = false;
  if (configured) {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { error } = await admin.from("gamer_subscriptions").select("user_id").limit(1);
    databaseReady = !error;
  }

  const env = process.env.PADDLE_ENV === "sandbox" ? "sandbox" : "live";
  return NextResponse.json({
    provider: "Paddle",
    mode: env,
    proCheckoutEnabled: configured && databaseReady,
    reason: !configured
      ? "Paddle account, price IDs, webhook secret, Supabase service key, and explicit enable flag must be configured first."
      : !databaseReady
        ? "Run SUPABASE_BILLING_SETUP.sql in Supabase before enabling checkout."
        : null,
  });
}
