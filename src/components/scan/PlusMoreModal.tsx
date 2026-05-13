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
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

interface ResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statusObj: string;
  guestTitle?: string;
}

const PlusMoreModal = ({
  open,
  onOpenChange,
  statusObj,
  guestTitle,
}: ResultModalProps) => {
  const status = statusObj
    .split("_")
    .map((ele, i) => {
      if (!ele.endsWith("ed") && i == 0) {
        return ele + "ed";
      }
      return ele;
    })
    .join(" ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xs sm:max-w-xs p-0! overflow-hidden'>
        <DialogHeader
          className={cn(
            "flex flex-col gap-5 w-full aspect-[1/0.9] rounded-b-full p-6",
            statusObj !== null ? "bg-green-800" : "bg-red-800"
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
        </DialogHeader>

        {statusObj && (
          <div className='text-center text-green-800 font-medium'>
            This extra guest is now {status}
          </div>
        )}
        <DialogFooter className='mb-0!'>
          <Button
            className='w-full bg-green-800 hover:bg-green-900 py-4'
            onClick={() => {
              // Save changes logic here
              onOpenChange(false);
            }}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlusMoreModal;
