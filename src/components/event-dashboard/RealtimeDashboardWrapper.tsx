"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { computeStats } from "@/lib/events/events";
import { TemplateLayout } from "@/actions/manageEventConfig";

import EventStats from "@/components/event-dashboard/EventStats";
import CustomizeNeeds from "@/components/event-dashboard/CustomizeNeeds";
import TableView, {
  CardNeedsStatus,
} from "@/components/event-dashboard/TableView";
import { toast } from "sonner";

interface CardTypes {
  id: string;
  event_id: string;
  name: string;
  template_url: string;
  template_layout: TemplateLayout;
  applies_to_plus_one: boolean;
  needs: {
    id: number;
    name: string;
  }[];
}
type ObjType = { [key: string]: string | number | boolean };
type CardTableItem = {
  id: string;
  name: string;
  tableData: ObjType[];
};

interface GuestCards {
  guest_id: string;
  card_type_id: string;
  status: { [key: string]: boolean };
  qr_code_url: string;
  QRSentStatus: string;
}

interface InitialProps {
  EventId: string;
  Stats: { [key: string]: number };

  CardNeeds: {
    id: string;
    name: string;
    is_active: boolean;
  }[];

  GuestCards: GuestCards[];
  // eslint-disable-next-line
  Attendees: Record<string, any>[];

  CardWithTableData: CardTableItem[];

  CardTypes: CardTypes[];
  Role: string;
  CardNeedsStatus: CardNeedsStatus;
  necessaryColumns: string[];
  statusCols: string[];
}

export default function RealtimeDashboardWrapper({
  EventId,
  Stats,
  CardNeeds,
  GuestCards,
  Attendees,
  CardWithTableData,
  CardTypes,
  Role,
  CardNeedsStatus,
  necessaryColumns,
  statusCols
}: InitialProps) {
  const supabase = createClient();

  const [stats, setStats] = useState(Stats);

  const [cardNeeds, setCardNeeds] = useState(CardNeeds);

  const [cardTypes] = useState<CardTypes[]>(CardTypes);

  const [guestCards, setGuestCards] = useState<GuestCards[]>(GuestCards);
  //eslint-disable-next-line
  const [attendees, setAttendees] =
    useState<Record<string, string | number>[]>(Attendees);

  const [necessaryCols, setNecessaryCols] =
    useState<string[]>(necessaryColumns);

  const [cardWithTableData, setCardWithTableData] =
    useState<CardTableItem[]>(CardWithTableData);

  // ===== Helper: rebuild full table (used rarely) ===== //
  const rebuildCardTable = useCallback(
    (newAttendees = attendees, newGuestCards = guestCards, cols= necessaryCols) => {
      const merged = cardTypes.map((ctd) => {
        let filteredAtts = newAttendees;

        if (!ctd.applies_to_plus_one) {
          // Because main_guest_id may not be on the table, we check for the existence, if not there
          // then it means all attendees on the table are not plus_ones
          // and if main_guest_id is on the table, all we do is check for instances where main_guest_id is not null
          filteredAtts = newAttendees.filter(
            (a) => !("main_guest_id" in a) || a?.main_guest_id === null
          );
        }

        const cardsOfType = newGuestCards.filter(
          (c) => c.card_type_id === ctd.id
        );

        const cardMap = Object.fromEntries(
          cardsOfType.map((c) => [
            c.guest_id,
            { ...c.status, qr: c.qr_code_url, QRStatus: c.QRSentStatus },
          ])
        );

        // const rows = filteredAtts.map((att, idx) => ({
        //   "s/n": idx + 1,
        //   id: att.id,
        //   ...Object.fromEntries(
        //     Object.entries(att).filter(([k]) =>
        //       k.toLowerCase().includes("name")
        //     )
        //   ),
        //   ...cardMap[att.id],
        // }));
        const rows = filteredAtts.map((att, idx) => {
          const extraData: { [key: string]: string | number } = {};

          for (const extra of cols) {
            if (extra in att) {
              extraData[extra] = att[extra] as string | number;
            }
          }

          return {
            "s/n": idx + 1,
            id: att.id,
            // ...Object.fromEntries(
            //   Object.entries(att).filter(([k]) =>
            //     k.toLowerCase().includes("name")
            //   )
            // ),
            ...extraData,
            ...cardMap[att.id],
          };
        });

        return { id: ctd.id, name: ctd.name, tableData: rows };
      });

      setCardWithTableData(merged);
    },
    [attendees, guestCards, cardTypes, necessaryCols]
  );

  // 🔥 Initial compute: No SQL calls
  const recomputeStats = useCallback(
    async (newGuestCards = guestCards, newCardNeeds = cardNeeds) => {
      const statuses = newGuestCards.map((c) => c.status);
      const needNames = newCardNeeds.map((n) => n.name);

      const stats = computeStats(statuses, needNames);

      // Add total attendees to stats
      stats["Total Attendees"] = attendees.length;
      setStats(stats);
    },
    [guestCards, cardNeeds, attendees]
  );

  const syncStats = useCallback(async () => {
    const { data, error } = await supabase
      .from("card_needs")
      .select("id, name, is_active")
      .eq("event_id", EventId);

    if (error || !data) return;
    setCardNeeds(data);
    recomputeStats(guestCards, data); // stats update
  }, [supabase, EventId, recomputeStats, guestCards]);

  const buildTabledueToCardChanges = useCallback(async () => {
    const { data, error } = await supabase
      .from("guest_cards")
      .select("guest_id, card_type_id, status, qr_code_url, QRSentStatus")
      .neq("qr_code_url", null)
      .eq("event_id", EventId);

    if (error || !data) return;

    setGuestCards(data);
    recomputeStats(data, cardNeeds);
    rebuildCardTable(attendees, data);
  }, [
    supabase,
    EventId,
    cardNeeds,
    attendees,
    rebuildCardTable,
    recomputeStats,
  ]);

  const buildTableDueToAttendeeChanges = useCallback(async () => {
    const { data, error } = await supabase
      .from(`event_${EventId}_attendees`)
      .select("*");

    if (error || !data) return;

    setAttendees(data);
    rebuildCardTable(data, guestCards, necessaryCols);
  }, [EventId, supabase, rebuildCardTable, guestCards, necessaryCols]);

  const rebuildTableColumns = useCallback(async () => {
    // Fetch the columns that must be displayed in the dashboard
    // Get the data for the active columns
    const { data: dashboardColumns, error: columnError } = await supabase
      .from("event_column_mappings")
      .select("name:supabase_column")
      .eq("event_id", EventId)
      .eq("is_active", true);

    if (columnError) {
      toast.error(columnError?.message || "Error fetching column data");
      return;
    }

    const columns = [
      ...dashboardColumns
        .filter((item) => item.name.toLowerCase().includes("name"))
        .map((item) => item.name),

      ...dashboardColumns
        .filter((item) => !item.name.toLowerCase().includes("name"))
        .map((item) => item.name),
    ]
    setNecessaryCols(columns);

    rebuildCardTable(attendees, guestCards, columns)
  }, [supabase, setNecessaryCols, EventId, attendees, guestCards, rebuildCardTable]);
  // ======================================================
  //              REAL-TIME LISTENERS
  // ======================================================

  useEffect(() => {
    const channel = supabase
      .channel(`dashboard-${EventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "card_needs",
          filter: `event_id=eq.${EventId}`,
        },
        () => {
          syncStats();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "guest_cards",
          filter: `event_id=eq.${EventId}`,
        },
        () => {
          buildTabledueToCardChanges();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: `event_${EventId}_attendees`,
        },
        () => {
          buildTableDueToAttendeeChanges();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: `event_column_mappings`,
          filter: `event_id=eq.${EventId}`,
        },
        () => {
          rebuildTableColumns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    EventId,
    CardNeeds,
    GuestCards,
    Attendees,
    supabase,
    buildTableDueToAttendeeChanges,
    buildTabledueToCardChanges,
    syncStats,
    rebuildTableColumns
  ]);

  return (
    <>
      <EventStats stats={stats} />
      <CustomizeNeeds eventId={EventId} needs={cardNeeds} role={Role} />
      <TableView
        cardWithTableData={cardWithTableData}
        eventId={EventId}
        cardNeedsStatus={CardNeedsStatus}
        statusCols={statusCols}
      />
    </>
  );
}
