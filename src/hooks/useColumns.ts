"use client";

import { createClient } from "@/lib/supabase/client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function useDashboardColumns(
  eventId: string,
  tableCols: {
    id: string;
    name: string;
    is_active: boolean;
  }[],
) {
  const supabase = createClient();

  const [tableColsState, setTableColsState] = useState(tableCols);

  // The function that fetches the card_needs when there has been an update
  const fetchTableCols = useCallback(async () => {
    // Get the data for the active columns
    const { data: dashboardColumns, error: columnError } = await supabase
      .from("event_column_mappings")
      .select("id, name:supabase_column, is_active")
      .eq("event_id", eventId);

    // If a particular error was encountered, just return
    // do not do anything.
    if (columnError) {
      toast.error(columnError?.message || "Error fetching column data");
      return;
    }

    // If successful, set needs
    setTableColsState(dashboardColumns);
  }, [eventId, supabase]);

  // Set up a listener to listen to the card_needs table, if some stuff changes, we update the needs state
  useEffect(() => {
    const channel = supabase
      .channel("event-")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: `event_column_mappings`,
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchTableCols();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, supabase, fetchTableCols]);

  return tableColsState;
}

export function useStatusColumns(eventId: string, statusCols: string[]) {
  const supabase = createClient();

  const [statusColsState, setStatusColsState] = useState(statusCols);

  // The function that fetches the card_needs when there has been an update
  const fetchStatusCols = useCallback(async () => {
    // Get the data for the active columns
    const { data: statusFields, error: statusFieldsError } = await supabase
      .from("event_column_mappings")
      .select("name:supabase_column")
      .eq("event_id", eventId)
      .eq("is_active", true)
      .neq("data_type", "boolean");
    // If a particular error was encountered, just return
    // do not do anything.
    if (statusFieldsError) {
      toast.error(statusFieldsError?.message || "Error fetching column data");
      return;
    }

    const cols = statusFields.map((item) => item.name);

    // If successful, set needs
    setStatusColsState(cols);
  }, [eventId, supabase]);

  // Set up a listener to listen to the card_needs table, if some stuff changes, we update the needs state
  useEffect(() => {
    const channel = supabase
      .channel("event-")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: `event_column_mappings`,
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchStatusCols();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, supabase, fetchStatusCols]);

  return statusColsState;
}
