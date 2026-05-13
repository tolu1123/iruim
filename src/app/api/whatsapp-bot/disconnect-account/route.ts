// app/api/whatsapp-bot/disconnect-account/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BOT_URL = process.env.NEXT_PUBLIC_WHATSAPP_BOT_URL!;
const BOT_SECRET = process.env.BOT_SECRET!;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();

    const user = data?.claims;
    if (!user) {
      throw new Error("User does not exist");
    }
    // 2. Fetch user profile + role
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.sub)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (profile.role !== "Admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    // 3. Call your WhatsApp bot — NEVER send CORS headers here!
    const botResponse = await fetch(`${BOT_URL}/logout`, {
      method: "POST",
      headers: {
        "x-api-key": BOT_SECRET,
        // Only send what the bot expects
      },
    });

    const botData = await botResponse.json();

    // 4. Forward bot response with proper CORS headers
    return NextResponse.json(botData, {
      status: botResponse.ok ? 200 : botResponse.status,
    });
    // eslint-disable-next-line
  } catch (err) {
    // Invalid/expired token
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 },
    );
  }
}
