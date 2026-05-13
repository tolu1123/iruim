import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_JWT_SECRET!,
  );

  // 1. Get all events that have tableName + sheetLink
  const { data: events, error } = await supabase
    .from("events")
    .select("id, sheetLink, tableName")
    .neq("tableName", null)
    .neq("sheetLink", null);

  if (error) {
    return NextResponse.json(
      { error: error.message, marker: "get_events" },
      { status: 400 },
    );
  }

  if (!events || events.length === 0) {
    return NextResponse.json({
      success: true,
      message: "No events eligible for syncing",
    });
  }

  const results = [];

  // 2. Loop through events and call the sync endpoint
  for (const event of events) {
    try {
      const sheetUrl = event.sheetLink;
      const eventId = event.id;

      const syncRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/sheets/sync-tables`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sheetUrl,
            eventId,
          }),
        },
      );

      const syncJson = await syncRes.json();

      results.push({
        eventId,
        tableName: event.tableName,
        status: syncRes.ok ? "success" : "failed",
        detail: syncJson,
      });
    } catch (err) {
      results.push({
        eventId: event.id,
        tableName: event.tableName,
        status: "error",
        detail: (err as Error).message,
      });
    }
  }

  return NextResponse.json({
    success: true,
    totalEvents: events.length,
    results,
  });
}
