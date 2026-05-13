// // This Api is for syncing data between google sheets and supabase
// // It is kind of intricate
// // The seemingly simple hard logic here is that
// // 1. Get all the headers aside from the sync_status and idempotency_key columns
// // (Because we do not want to guess for google sheets, we then build a mapping)
// // (And because google sheets returns each rows in an array)
// // (And since we stored what the supabase knows which column has)
// // (We will map the column name that supabase knows to the exact column of google sheets)
// // (But since you know that google sheets return rows as an array)
// // (columns in google sheets are represented as numbers in the mapping)

// // From there we can read and build our object that will be written to supabase using the mappings

// import { NextResponse } from "next/server";
// import { getSheetData, updateSyncedRows } from "@/lib/sheets/googleSheets";
// import { createClient } from "@supabase/supabase-js";
// import parsePhoneNumber from "libphonenumber-js";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_PUBLISHABLE_KEY!
// );

// export async function POST(req: Request) {
//   const { sheetUrl, eventId } = await req.json();

//   // Parse out the sheet ID from the URL
//   const sheetId = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
//   if (!sheetId)
//     return NextResponse.json({ error: "Invalid sheet URL" }, { status: 400 });

//   // Use the eventId to fetch the no of columns in sheet
//   const columnData = await supabase
//     .from("event_column_mappings")
//     .select("*")
//     .eq("event_id", eventId);
//   if (columnData.error)
//     return NextResponse.json(
//       { error: columnData.error.message, errorMarker: "event_column_mappings" },
//       { status: 400 }
//     );

//   const columnRange = `A:Z`;

//   // Fetch the sheet data
//   const rows = await getSheetData(sheetId, columnRange);

//   // Get the header but exclude the sync_status of an eventId from it
//   const headers = rows[0].filter((ele) => !ele.startsWith("sync_status") || !ele.startsWith("idempotency_key")); // Remove the sync_status or idempotency_key columns if they exist in the headers
//   // We get the mapping info from the event_column_mappings table
//   const mappingInfo = columnData.data;
//   // We use the mapper to build the mapping between sheet columns and supabase columns
//   // This is used to know what the event specifically needs to be mapped onto its table
//   const mapper: { [key: string]: number } = mappingInfo.reduce((acc, curr) => {
//     acc[curr.supabase_column] = headers.indexOf(curr.sheet_column);
//     return acc;
//   }, {} as { [key: string]: number });

//   // The mappedRows store the rows that will be inserted into supabase
//   const mappedRows: { [key: string]: string | boolean | number }[] = [];
//   // The Updates array stores the updates that will be applied on google sheets for synced rows
//   const updates = [];

//   // Here we build the object from the column_mapping
//   const columnName = `sync_status${eventId}`;
//   const syncStatusIndex = rows[0].indexOf(columnName);
//   // Here i get the column letter for sync_status<eventId> header
//   const syncStatusColumn = String.fromCharCode(65 + syncStatusIndex);

//   for (let i = 1; i < rows.length; i++) {
//     const dataRow = rows[i];

//     // We find the syncStatusIndex header position
//     // If it is not in the header, we cannot proceed
//     if (syncStatusIndex === -1) break;

//     if (dataRow[syncStatusIndex] === "synced") continue; // Check if sync_status column for the event is not 'synced', if synced, jump to the next iteration

//     const rowObject: { [key: string]: string | boolean | number } = {};

//     let rowOk = true; // We use this flag to determine if the row has any invalid data

//     for (const [supabaseCol, index] of Object.entries(mapper)) {
//       // If the column is plus_one, we need to convert 'yes'/'no' to boolean
//       if (supabaseCol === "plus_one") {
//         const plusOneColumn = dataRow[index].trim().toLowerCase();

//         // If there is a yes in the column, it means the guest will be bringing a plus_one
//         // If there is not a "no", it means the guest will be bringing more than a plus_one
//         // If there is a "no", it means the guest will be coming alone

//         const hasNo = /\bno\b/i.test(plusOneColumn);
//         // eslint-disable-next-line
//         const hasYes = /\byes\b/i.test(plusOneColumn);

//         rowObject[supabaseCol] = rowObject[supabaseCol] = hasNo ? false : true;
//         continue;
//       }

//       // If the column is phone_no, we need to validate and format it
//       // If invalid, we skip the row
//       if (supabaseCol === "phone_no") {
//         const phoneNo: string = dataRow[index] || "";
//         const regex = /[^+-\d]/gi;
//         const cleanedPhoneNo: string = phoneNo.replace(regex, "");
//         const parsedPhoneNo: string | undefined = parsePhoneNumber(
//           cleanedPhoneNo,
//           "NG"
//         )?.format("E.164");

//         if (!parsedPhoneNo) {
//           rowOk = false;
//           break; // Invalid phone number, skip this row
//         }

//         rowObject[supabaseCol] = parsedPhoneNo;
//         continue;
//       }

//       // We check here if the supabaseCol is a boolean field, if it is
//       // we act appropriately
//       if (
//         mappingInfo.find((ele) => ele.supabase_column === supabaseCol)
//           .data_type === "boolean"
//       ) {
//         rowObject[supabaseCol] = /\byes\b/i.test(dataRow[index].toLowerCase())
//           ? true
//           : false;

//         // We continue
//         continue;
//       }

//       rowObject[supabaseCol] = dataRow[index] || null;
//     }
//     if (!rowOk) continue; // If any data in the row is invalid, skip this row
//     mappedRows.push(rowObject);

//     // We also prepare the update for sync_status
//     updates.push({
//       range: `${syncStatusColumn}${i + 1}`,
//       values: [["synced"]],
//     });
//   }

//   // We insert the mappedRows into supabase in bulk
//   const tableName = `event_${eventId}_attendees`;

//   const { error } = await supabase.from(tableName).insert(mappedRows);
//   if (error) {
//     return NextResponse.json(
//       { error: (error as Error).message, errorMarker: "supabase_insert" },
//       { status: 400 }
//     );
//   }

//   // We also update the google sheet to mark the synced rows
//   const updateResult = await updateSyncedRows(sheetId, updates);

//   // If update failed, we return error
//   if (updateResult.success === false)
//     return NextResponse.json({ error: updateResult.message }, { status: 500 });

//   // Return success response with the number of inserted rows
//   return NextResponse.json({ success: true, insertedRows: mappedRows.length });
// }

// This Api is for syncing data between google sheets and supabase
// It is kind of intricate
// The seemingly simple hard logic here is that
// 1. Get all the headers aside from the sync_status and idempotency_key columns
// (Because we do not want to guess for google sheets, we then build a mapping)
// (And because google sheets returns each rows in an array)
// (And since we stored what the supabase knows which column has)
// (We will map the column name that supabase knows to the exact column of google sheets)
// (But since you know that google sheets return rows as an array)
// (columns in google sheets are represented as numbers in the mapping)

// From there we can read and build our object that will be written to supabase using the mappings

// On top of that, we have a two-phase commit pattern to handle partial failures
// Phase 1: Assign UUIDs to all unsynced rows that don't have one yet (write to sheet first)
// Phase 2: Build mappedRows, insert into supabase, then mark as synced
// This way, if anything fails at any point, the next run can recover cleanly
// (Rows that got a UUID but failed supabase insertion will reuse their UUID on the next run)
// (Rows that were inserted but never marked synced won't be duplicated because of onConflict: ignore)

import { NextResponse } from "next/server";
import { getSheetData, updateSyncedRows } from "@/lib/sheets/googleSheets"; // writeIdempotencyKeys
import { createClient } from "@supabase/supabase-js";
import parsePhoneNumber from "libphonenumber-js";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_JWT_SECRET!,
);

export async function POST(req: Request) {
  const { sheetUrl, eventId } = await req.json();

  // Parse out the sheet ID from the URL
  const sheetId = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
  if (!sheetId)
    return NextResponse.json({ error: "Invalid sheet URL" }, { status: 400 });

  // Use the eventId to fetch the column mappings for this event
  const columnData = await supabase
    .from("event_column_mappings")
    .select("*")
    .eq("event_id", eventId);

  if (columnData.error)
    return NextResponse.json(
      { error: columnData.error.message, errorMarker: "event_column_mappings" },
      { status: 400 },
    );

  const columnRange = `A:Z`;

  // Fetch the sheet data
  const rows = await getSheetData(sheetId, columnRange);

  // Get the header row and find the positions of our control columns
  // We exclude sync_status and idempotency_key from the mapping headers
  // because they are control columns, not data columns
  const headers = rows[0].filter(
    (ele) =>
      !ele.startsWith("sync_status") && !ele.startsWith("idempotency_key"),
  );

  // We get the mapping info from the event_column_mappings table
  const mappingInfo = columnData.data;

  // We use the mapper to build the mapping between sheet columns and supabase columns
  // This is used to know what the event specifically needs to be mapped onto its table
  const mapper: { [key: string]: number } = mappingInfo.reduce(
    (acc, curr) => {
      acc[curr.supabase_column] = headers.indexOf(curr.sheet_column);
      return acc;
    },
    {} as { [key: string]: number },
  );

  // We derive both control column positions dynamically from the header row
  // We never assume a fixed column letter for either of these
  const syncStatusColumnName = `sync_status${eventId}`;
  const syncStatusIndex = rows[0].indexOf(syncStatusColumnName);
  const idempotencyKeyIndex = rows[0].indexOf("idempotency_key");

  // If the sync_status column for this event is missing, we cannot proceed
  // This is not a row-level failure, it is a configuration failure — we abort
  if (syncStatusIndex === -1)
    return NextResponse.json(
      {
        error: `Missing column: ${syncStatusColumnName}`,
        errorMarker: "missing_sync_status_column",
      },
      { status: 400 },
    );

  // Same for idempotency_key — it must exist in the sheet before we can do anything
  if (idempotencyKeyIndex === -1)
    return NextResponse.json(
      {
        error: "Missing column: idempotency_key",
        errorMarker: "missing_idempotency_key_column",
      },
      { status: 400 },
    );

  // Derive the column letters for our control columns from their index positions
  // This is how we know where to write back to in the sheet
  const syncStatusColumn = String.fromCharCode(65 + syncStatusIndex);
  const idempotencyKeyColumn = String.fromCharCode(65 + idempotencyKeyIndex);

  // -----------------------------------------------------------------------
  // PHASE 1: UUID Assignment
  // We go through all unsynced rows and assign a UUID to any that don't have one
  // We do this BEFORE building mappedRows or touching supabase
  // The UUID is what ties a sheet row to a supabase row across retries
  // If this phase fails, we abort entirely — nothing has touched supabase yet
  // -----------------------------------------------------------------------

  // We collect the uuid writes we need to make for rows that don't have one yet
  const uuidWrites: { range: string; values: string[][] }[] = [];

  // We also build a map of row index to UUID so we can use it in phase 2
  // without re-reading the sheet
  const rowUUIDs: { [rowIndex: number]: string } = {};

  for (let i = 1; i < rows.length; i++) {
    const dataRow = rows[i];

    // Skip rows that are already synced — they don't need a UUID write or anything else
    if (dataRow[syncStatusIndex] === "synced") continue;

    // If the row already has a UUID, reuse it
    // This handles the case where a previous run assigned a UUID but failed before supabase insertion
    // We never overwrite an existing UUID — that would break the idempotency guarantee
    const existingUUID = dataRow[idempotencyKeyIndex];
    if (existingUUID) {
      rowUUIDs[i] = existingUUID;
      continue;
    }

    // Row has no UUID yet — generate one and queue it for writing
    const newUUID = uuidv4();
    rowUUIDs[i] = newUUID;
    uuidWrites.push({
      range: `${idempotencyKeyColumn}${i + 1}`,
      values: [[newUUID]],
    });
  }

  // If there are new UUIDs to write, we batch write them to the sheet first
  // If this fails, we abort entirely — we do not proceed to supabase
  // On the next run, rows that already got a UUID will reuse it, rows that didn't will get a new one
  if (uuidWrites.length > 0) {
    const uuidWriteResult = await updateSyncedRows(sheetId, uuidWrites);
    if (uuidWriteResult.success === false)
      return NextResponse.json(
        { error: uuidWriteResult.message, errorMarker: "uuid_write_failed" },
        { status: 500 },
      );
  }

  // -----------------------------------------------------------------------
  // PHASE 2: Build, Insert, Mark Synced
  // Now that every unsynced row has a UUID in the sheet, we can safely build
  // our mappedRows and insert them into supabase
  // Row-level failures (bad phone number etc.) skip that row but do not abort the operation
  // Operation-level failures (supabase error etc.) abort entirely
  // -----------------------------------------------------------------------

  // The mappedRows store the rows that will be inserted into supabase
  const mappedRows: { [key: string]: string | boolean | number | null }[] = [];
  // The updates array stores the sync_status writes for rows we successfully mapped
  const updates: { range: string; values: string[][] }[] = [];

  for (let i = 1; i < rows.length; i++) {
    const dataRow = rows[i];

    // Skip rows that are already synced
    if (dataRow[syncStatusIndex] === "synced") continue;

    // If this row has no UUID in our map it means it was skipped entirely in phase 1
    // (which shouldn't happen, but we guard against it anyway)
    const rowUUID = rowUUIDs[i];
    if (!rowUUID) continue;

    const rowObject: { [key: string]: string | boolean | number | null } = {};
    let rowOk = true; // We use this flag to determine if the row has any invalid data

    for (const [supabaseCol, index] of Object.entries(mapper)) {
      // If the column is plus_one, we need to convert 'yes'/'no' to boolean
      if (supabaseCol === "plus_one") {
        const plusOneColumn = dataRow[index].trim().toLowerCase();

        // If there is a "no" in the column, the guest is coming alone
        // If there is a "yes" or anything else, the guest is bringing a plus one
        const hasNo = /\bno\b/i.test(plusOneColumn);

        rowObject[supabaseCol] = hasNo ? false : true;
        continue;
      }

      // If the column is phone_no, we need to validate and format it
      // If invalid, this is a row-level failure — we skip this row and move on
      if (supabaseCol === "phone_no") {
        const phoneNo: string = dataRow[index] || "";
        const regex = /[^+-\d]/gi;
        const cleanedPhoneNo: string = phoneNo.replace(regex, "");
        const parsedPhoneNo: string | undefined = parsePhoneNumber(
          cleanedPhoneNo,
          "NG",
        )?.format("E.164");

        if (!parsedPhoneNo) {
          rowOk = false;
          break; // Invalid phone number — row-level failure, skip this row
        }

        rowObject[supabaseCol] = parsedPhoneNo;
        continue;
      }

      // We check here if the supabaseCol is a boolean field, if it is
      // we act appropriately
      if (
        mappingInfo.find((ele) => ele.supabase_column === supabaseCol)
          ?.data_type === "boolean"
      ) {
        rowObject[supabaseCol] = /\byes\b/i.test(dataRow[index].toLowerCase())
          ? true
          : false;
        continue;
      }

      rowObject[supabaseCol] = dataRow[index] || null;
    }

    if (!rowOk) continue; // Row-level failure — skip this row, the UUID stays in the sheet for the next run

    // We use the UUID from phase 1 as the id for the supabase row
    // This is what gives us idempotency — if this row was inserted before
    // but never marked synced, supabase will see the conflict and ignore the duplicate
    rowObject["id"] = rowUUID;
    mappedRows.push(rowObject);

    // We also queue the sync_status update for this row
    // We only do this after a successful supabase insert (see below)
    updates.push({
      range: `${syncStatusColumn}${i + 1}`,
      values: [["synced"]],
    });
  }

  // If there is nothing to insert, we return early
  // This can happen if all rows were already synced or all rows had row-level failures
  if (mappedRows.length === 0)
    return NextResponse.json({ success: true, insertedRows: 0 });

  // We insert the mappedRows into supabase in bulk
  // onConflict: ignore means if a row with the same id already exists, we skip it
  // This is what makes retries safe — a row that was inserted before but never marked synced
  // will not be duplicated
  const tableName = `event_${eventId}_attendees`;
  const { error } = await supabase.from(tableName).upsert(mappedRows, {
    onConflict: "id",
    ignoreDuplicates: true,
  });

  // If supabase insert fails, we abort entirely — operation-level failure
  // The UUIDs are already in the sheet, so the next run will reuse them and retry cleanly
  if (error)
    return NextResponse.json(
      { error: (error as Error).message, errorMarker: "supabase_insert" },
      { status: 400 },
    );

  // Supabase insert succeeded — now we mark all the synced rows in the sheet
  // If this fails, the data is already safely in supabase
  // The next run will attempt to insert the same rows, supabase will ignore the conflicts,
  // and then attempt to mark them synced again
  const updateResult = await updateSyncedRows(sheetId, updates);
  if (updateResult.success === false)
    return NextResponse.json({ error: updateResult.message }, { status: 500 });

  // Return success response with the number of inserted rows
  return NextResponse.json({ success: true, insertedRows: mappedRows.length });
}
