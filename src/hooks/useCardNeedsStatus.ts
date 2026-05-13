"use client";

import { createClient } from "@/lib/supabase/client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function useCardNeedsStatus(
  eventId: string,
  cardNeeds: {
    card_type_id: string;
    name: string;
    is_active: boolean;
  }[],
) {
  const supabase = createClient();

  const [needs, setNeeds] = useState(cardNeeds);

  // The function that fetches the card_needs when there has been an update
  const fetchCardNeeds = useCallback(async () => {
    //Use eventId to fetch all card_needs that applies to the particular event
    const { data, error } = await supabase
      .from("card_needs")
      .select("card_type_id, name, is_active")
      .eq("event_id", eventId);

    // If a particular error was encountered, just return
    // do not do anything.
    if (!data || error) {
      // Display error
      toast.error(
        "Failed to sync needs, please check your internet connection and reload.",
      );
      return;
    }

    // If successful, set needs
    setNeeds(data);
  }, [eventId, supabase]);

  // Set up a listener to listen to the card_needs table, if some stuff changes, we update the needs state
  useEffect(() => {
    const channel = supabase
      .channel("event-needs")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "card_needs",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchCardNeeds();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, supabase, fetchCardNeeds]);

  return needs;
}
