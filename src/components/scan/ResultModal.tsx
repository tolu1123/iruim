import React from "react";

import { format } from "date-fns";

import { CheckCircle, AlertCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

interface ResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStatusObj: Record<string, boolean>; // We use this prop for initial statuses, if status was false initially, you cannot toggle it
  statusObj: Record<string, boolean>;
  setStatusObj: React.Dispatch<
    React.SetStateAction<Record<string, boolean> | null>
  >;
  guestId: string;
  cardType: string;
  saveChanges: (
    guestId: string,
    cardType: string,
    statusObj: Record<string, boolean>,
  ) => Promise<boolean>;
  cardNeedsStatus: {
    card_type_id: string;
    name: string;
    is_active: boolean;
  }[];
  guestTitle?: string;
}

const ResultModal = ({
  open,
  onOpenChange,
  initialStatusObj,
  statusObj,
  setStatusObj,
  guestId,
  cardType,
  saveChanges,
  cardNeedsStatus,
  guestTitle,
}: ResultModalProps) => {
  const needs = Object.entries(statusObj ?? {});
  // Filter the needs so we get only the needs that apply to this card_type that was passed in
  const filteredCardNeedsStatus = cardNeedsStatus.filter(
    (ele) => ele.card_type_id === cardType,
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xs sm:max-w-xs p-0! overflow-hidden'>
        <DialogHeader
          className={cn(
            "flex flex-col gap-5 w-full aspect-[1/0.9] rounded-b-full p-6",
            statusObj !== null ? "bg-green-800" : "bg-red-800",
          )}
        >
          <div className='flex flex-col items-center gap-3'>
            {statusObj !== null ? (
              <CheckCircle className='h-10 w-10 text-white' />
            ) : (
              <AlertCircle className='h-10 w-10 text-white' />
            )}
            <DialogTitle className={cn("text-white")}>
              {statusObj !== null ? "Success" : "Error"}
            </DialogTitle>
          </div>

          {guestTitle ? (
            <p className='my-3 text-bold text-white font-bold text-xl text-center'>
              {guestTitle}
            </p>
          ) : (
            <DialogDescription
              className={cn("text-center text-white text-xl font-bold")}
            >
              Card needs
            </DialogDescription>
          )}

          {guestId && (
            <p className='mt-0.5 text-bold text-white font-medium text-base text-center'>
              {guestId}
            </p>
          )}
        </DialogHeader>

        {statusObj !== null && (
          <div
            className={cn(
              "my-4 rounded-lg p-4 mx-6 flex flex-col gap-2",
              statusObj !== null
                ? "bg-green-800"
                : "bg-red-800 text-center text-white",
            )}
          >
            {needs.map((ele, i) => {
              const need_status = filteredCardNeedsStatus.find(
                (need) => need.name == ele[0],
              )?.is_active;
              return (
                <div key={i} className='flex items-start gap-3'>
                  <Checkbox
                    className='data-[state=checked]:bg-green-800! data-[state=checked]:border-white!'
                    id={`toggle-${ele[0]}`}
                    disabled={initialStatusObj[ele[0]] || need_status === false}
                    checked={ele[1]}
                    onCheckedChange={(checked) => {
                      setStatusObj((prev) => ({
                        ...(prev ?? {}),
                        [ele[0]]: checked as boolean,
                      }));
                    }}
                  />
                  <Label htmlFor={`toggle-${ele[0]}`} className='text-white'>
                    {ele[0].replace("_", " ")}
                  </Label>
                </div>
              );
            })}
          </div>
        )}
        <DialogFooter className='p-2'>
          <Button
            className='w-full bg-green-800 hover:bg-green-900'
            onClick={async () => {
              // Save changes logic here
              const success = await saveChanges(guestId, cardType, statusObj);
              if (success) {
                onOpenChange(false);
              }
            }}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResultModal;
