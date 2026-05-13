// app/api/whatsapp-bot/getQr/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_PUBLISHABLE_KEY!,
);

const BOT_URL = process.env.NEXT_PUBLIC_WHATSAPP_BOT_URL!;
const BOT_SECRET = process.env.BOT_SECRET!;
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;

// ──────────────────────────────────────
// GET /api/whatsapp-bot/getQr
// ──────────────────────────────────────
export async function GET(request: Request) {
  // Extract Bearer token
  const authHeader =
    request.headers.get("authorization") ??
    request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 },
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    // 1. Verify JWT
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };

    // 2. Fetch user profile + role
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", payload.sub)
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
    const botResponse = await fetch(`${BOT_URL}/getQr`, {
      method: "GET",
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
  } catch (err) {
    // Invalid/expired token
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 },
    );
  }
}

// export const runtime = "nodejs";

// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import { createClient } from "@supabase/supabase-js";
// import { getCorsHeaders } from "@/lib/cors";

// const supabase = createClient(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_PUBLISHABLE_KEY!
// );

// const botUrl = process.env.NEXT_PUBLIC_WHATSAPP_BOT_URL!;
// const botSecret = process.env.BOT_SECRET!;
// const secretKey = process.env.SUPABASE_JWT_SECRET!;

// export async function GET(req: Request) {
//   const origin = req.headers.get("origin");
//   const corsHeaders = getCorsHeaders(origin);

//   // Handle OPTIONS preflight
//   if (req.method === "OPTIONS") {
//     return new Response(null, { headers: corsHeaders });
//   }

//   // Only allow GET beyond this point
//   if (req.method !== "GET") {
//     return new Response(JSON.stringify({ error: "Method not allowed" }), {
//       status: 405,
//       headers: corsHeaders,
//     });
//   }

//   const authHeader =
//     req.headers.get("authorization") ?? req.headers.get("Authorization");

//   if (!authHeader) {
//     return NextResponse.json(
//       { message: "missing auth header" },
//       { status: 401, headers: corsHeaders }
//     );
//   }

//   const token = authHeader.split(" ")[1];

//   if (!token)
//     return NextResponse.json({ error: "Missing token" }, { status: 401, headers: corsHeaders });

//   try {
//     const payload = jwt.verify(token, secretKey);
//     if (!payload)
//       return NextResponse.json(
//         { error: "Authorization not valid" },
//         { status: 401, headers: corsHeaders }
//       );

//     // Then we check if the incoming request is from an admin, if not error
//     const { data, error } = await supabase
//       .from("profiles")
//       .select("id, role")
//       .eq("id", payload.sub)
//       .single();

//     if (error) {
//       return NextResponse.json(
//         { error: "User verification failed" },
//         { status: 500, headers: corsHeaders }
//       );
//     }

//     // We perform the check
//     if (data.role !== "Admin")
//       return NextResponse.json(
//         { error: "Not authorized to view this resource" },
//         { status: 403, headers: corsHeaders }
//       );

//     // Then we make our request to our bot
//     const response = await fetch(`${botUrl}/getQr`, {
//       method: "GET",
//       headers: {
//         "x-api-key": botSecret,
//         ...corsHeaders
//       },
//     });

//     const qrData = await response.json();
//     return NextResponse.json(qrData, { status: response.status, headers: corsHeaders });

//     // eslint-disable-next-line
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Invalid or expired token" },
//       { status: 401, headers: corsHeaders }
//     );
//   }
// }
