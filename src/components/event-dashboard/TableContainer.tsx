"use client";

import { useState } from "react";
import DataTable from "@/components/event-dashboard/DataTable";
import ResultModal from "@/components/scan/ResultModal";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  sendInvitationCard,
  sendInvitationCardToPlusOne,
} from "@/actions/qrAction";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { CardNeedsStatus } from "./TableView";
import useCardNeedsStatus from "@/hooks/useCardNeedsStatus";
import { useStatusColumns } from "@/hooks/useColumns";

type TableData = { [key: string]: string | boolean | number }[];
type CellAction = (row: { [key: string]: string | boolean | number }) => void;

function generateColumns(
  tableData: TableData,
  onStatusClick: CellAction,
  onQRClick: CellAction,
  cols: string[]
) {
  if (!tableData || tableData.length === 0) return [];

  const sample = tableData[0];
  const keys = Object.keys(sample);

  return keys.map((key) => {
    /** ID + qr + QRStatus and anything that has name in it is NOT a status fields */
    const isStatusField =
      ![
        "id",
        "s/n",
        "qr",
        "QRStatus",
        ...cols
      ].includes(key) && !key.toLowerCase().includes("name");
    const title = key.replace("_", " ");
    const headerTitle =
      title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
    return {
      accessorKey: key,
      id: key,
      header: headerTitle,
      // @ts-expect-error I do not know type of row
      cell: ({ row }) => {
        const value = row.getValue(key);

        if (isStatusField) {
          return (
            <button
              className={`
                px-2 py-0.5 rounded 
                ${value ? "bg-lime-700 text-white" : "bg-amber-300 text-white"}
              `}
              onClick={() => onStatusClick(row.original)}
            >
              {value ? "YES" : "NO"}
            </button>
          );
        }

        // Check if it is the Qrstatus column and return a button to send Invitation code
        if (key === "QRStatus") {
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className={`
                px-2 py-0.5 rounded 
                ${
                  value == "Not Sent"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-black"
                }
              `}
                  onClick={() => onQRClick(row.original)}
                >
                  {value}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {value == "Not Sent" ? "Send" : "Resend"}
              </TooltipContent>
            </Tooltip>
          );
        }

        // Regular fields (id, name)
        return <span>{String(value)}</span>;
      },
    };
  });
}

export default function TableContainer({
  tableData,
  cardType,
  eventId,
  cardNeeds,
  statusCols
}: {
  tableData: { [key: string]: string | boolean | number }[];
  cardType: string;
  eventId: string;
  cardNeeds: CardNeedsStatus;
  statusCols: string[];
}) {
  // We hook into real timing using this hook
  const cardNeedsStatus = useCardNeedsStatus(eventId, cardNeeds);
  const cols = useStatusColumns(eventId, statusCols)

  const [statusObj, setStatusObj] = useState<Record<string, boolean> | null>(
    null
  );
  const [initialStatusObj, setInitialStatusObj] = useState<
    Record<string, boolean>
  >({});
  const [currentGuestId, setCurrentGuestId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const supabase = createClient();

  const saveChanges = async (
    guestId: string,
    cardType: string,
    statusObj: { [key: string]: boolean }
  ) => {
    const { error } = await supabase
      .from("guest_cards")
      .update({ status: statusObj })
      .eq("guest_id", guestId)
      .eq("card_type_id", cardType);

    if (error) {
      toast.error("Failed to update.");
      return false;
    }

    toast.success("Saved!");
    return true;
  };

  const onStatusClick = async (row: {
    [key: string]: string | boolean | number;
  }) => {
    const guestId: string = row.id as string;

    // Fetch existing status object
    const { data, error } = await supabase
      .from("guest_cards")
      .select("status")
      .eq("guest_id", guestId)
      .eq("card_type_id", cardType)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setInitialStatusObj(data.status); // original
    setStatusObj({ ...data.status }); // mutable copy
    setCurrentGuestId(guestId);
    setOpen(true);
  };

  const sendQR = async (row: { [key: string]: string | boolean | number }) => {
    const guestId: string = row.id as string;
    const qrCode: string = row.qr as string;

    // Fetch existing status object

    const { data, error } = await supabase
      .from(`event_${eventId}_attendees`)
      .select("*")
      .eq("id", guestId)
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    // We check if this is a plus one
    if ("main_guest_id" in data && data.main_guest_id !== null) {
      // If the card belongs to a plus one, we find the phone no of who is bringing him along and send it to him.
      const { data: phoneNoData, error: phoneNoError } = await supabase
        .from(`event_${eventId}_attendees`)
        .select("phone_no")
        .eq("id", data.main_guest_id)
        .single();

      if (phoneNoError) {
        toast.error(
          `${phoneNoError.message}, Check your internet connection and try again.`
        );
        return;
      }

      // Send the plusOne QR CODE
      const res = await sendInvitationCardToPlusOne(
        phoneNoData.phone_no,
        qrCode
      );

      // Toast the response
      if (res.error) {
        toast.error(res.message);
      }

      toast.success(res.message);
      return;
    }

    // Make a request to the endpoint to send the Invitation card to the attendees's whatsapp number
    const res = await sendInvitationCard(data.phone_no, qrCode);

    if (res.error) {
      toast.error(res.message);
    }

    toast.success(res.message);
  };
  const columns = generateColumns(tableData, onStatusClick, sendQR, cols);

  return (
    <>
      <DataTable columns={columns} data={tableData} />

      {statusObj !== null && (
        <ResultModal
          open={open}
          onOpenChange={setOpen}
          initialStatusObj={initialStatusObj}
          statusObj={statusObj}
          setStatusObj={setStatusObj}
          guestId={currentGuestId!}
          cardType={cardType}
          saveChanges={saveChanges}
          cardNeedsStatus={cardNeedsStatus}
        />
      )}
    </>
  );
}
