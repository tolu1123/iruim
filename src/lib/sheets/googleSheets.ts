import { google } from "googleapis";

// We use this function to get the headers from a given sheet
export async function getSheetHeaders(sheetId: string, range = "A1:Z1") {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });


  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });

  const headers = response.data.values?.[0];

  return headers || [];
}

// We use this function to add a new header for the event(sync_status<uuid>) to a given sheet
export async function addSheetHeader(sheetId: string, cell: string, columnName: string) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: cell,
      valueInputOption: "RAW",
      requestBody: {
        values: [[columnName]],
      },
    });

    // If header update went through, we return true
    return {
      success: true,
      message: "Header added successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message,
    };
  }
}

// We use this function to get all the rows from a given sheet and range
export async function getSheetData(sheetId: string, range: string) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });

  const rows = response.data.values || [];
  return rows;
}


// I use this function to update rows i have synced to supabase
export async function updateSyncedRows(
  sheetId: string,
  updates: { range: string; values: string[][] }[]
) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // We batch update the rows in the sheet
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        valueInputOption: "RAW",
        data: updates,
      },
    });

    return {
      success: true,
      message: "Synced rows updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message || "Error updating synced rows",
    }
  }
}
