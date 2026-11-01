import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const ownerId = process.env.GAMERRP_OWNER_USER_ID;

  if (!supabaseUrl || !publishableKey || !ownerId) {
    return NextResponse.json(
      { isOwner: false, configured: Boolean(supabaseUrl && publishableKey) },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return NextResponse.json(
      { isOwner: false, configured: true },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const client = createClient(supabaseUrl, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await client.auth.getUser(token);
  const isOwner = !error && Boolean(data.user) && data.user.id === ownerId;

  return NextResponse.json(
    { isOwner, configured: true },
    { headers: { "Cache-Control": "no-store" } }
  );
}
