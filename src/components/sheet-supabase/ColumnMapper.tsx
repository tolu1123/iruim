"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ColumnMapper({
  eventId,
  sheetUrl,
}: {
  eventId: string;
  sheetUrl: string;
}) {
  const router = useRouter()
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<
    { sheet: string; supabase: string; type: string }[]
  >([]);

  async function fetchHeaders() {
    const res = await fetch("/api/sheets/headers", {
      method: "POST",
      body: JSON.stringify({ sheetUrl }),
    });
    const data = await res.json();
    const headers = data.headers as string[];
    // We remove any column that starts with sync_status and idempotency_key if it exists in the header
    const filteredHeaders = headers.filter(
      (header) =>
        !header.startsWith("sync_status") &&
        !header.startsWith("idempotency_key"),
    );
    setHeaders(filteredHeaders);

    setMappings(
      filteredHeaders.map((header: string) => ({
        sheet: header, // the column from Google Sheet
        supabase: "", // What the admin wants the column in the google sheet to correspond to in Supabase
        type: "text", // default type of column in Supabase
      })),
    );
  }

  function handleMappingChange(
    i: number,
    key: keyof (typeof mappings)[0],
    value: string,
  ) {
    setMappings((prev) =>
      prev.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)),
    );
  }

  async function saveMappings() {
    try {
      const response = await fetch("/api/mappings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          mappings,
          sheetUrl,
        }),
      });

      if (!response.ok) {
        let errorMessage =
          "There was an error while saving mappings (Critical)";

        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          // Response wasn't JSON (e.g. Next.js HTML error page)
          errorMessage = `Server error (${response.status})`;
        }

        toast.error(errorMessage);
        return;
      }

      toast.success("Mappings saved successfully!");

      router.push(`/list-events/${eventId}/configure-event`)
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div className='space-y-4'>
      <button
        onClick={fetchHeaders}
        className='bg-orange-500 text-white px-4 py-2 rounded'
      >
        Fetch Google Sheet Columns
      </button>

      {headers.length > 0 && (
        <table className='min-w-full border mt-4'>
          <thead>
            <tr>
              <th>Sheet Column</th>
              <th>Supabase Column</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {headers.map((header, i) => (
              <tr key={i}>
                <td>{header}</td>
                <td>
                  <input
                    type='text'
                    placeholder='supabase_column'
                    onChange={(e) =>
                      handleMappingChange(i, "supabase", e.target.value.trim())
                    }
                    // We must detect if header is phone_no or plus_one and set its value accordingly
                    className='border p-1'
                  />
                </td>
                <td>
                  <select
                    onChange={(e) =>
                      handleMappingChange(i, "type", e.target.value)
                    }
                  >
                    <option value='text'>text</option>
                    <option value='boolean'>boolean</option>
                    <option value='integer'>integer</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {headers.length > 0 && (
        <button
          onClick={saveMappings}
          className='bg-green-600 text-white px-4 py-2 rounded'
        >
          Save Mapping
        </button>
      )}
    </div>
  );
}
