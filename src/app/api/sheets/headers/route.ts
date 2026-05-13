import { NextResponse } from "next/server";
import { getSheetHeaders } from "@/lib/sheets/googleSheets";

 
export async function POST(req: Request) {
  const { sheetUrl } = await req.json();

  const sheetId = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
  if (!sheetId)
    return NextResponse.json(
      { error: "Invalid sheet URL" },
      { status: 400 }
    );

  const headers = await getSheetHeaders(sheetId);
  return NextResponse.json({ headers });
}
