import React from "react";
import { AlertCircle} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { cn } from "@/lib/utils";

const ScannerOfflineModal = () => {
  return (
    <Dialog open={true}>
      <DialogContent showCloseButton={false} className='max-w-2xs sm:max-w-xs p-0! overflow-hidden'>
        <DialogHeader
          className={cn(
            "flex flex-col gap-5 w-full aspect-[1/0.7] rounded-b-full p-6 bg-red-800 text-white"
          )}
        >
          <div className='flex flex-col items-center gap-3'>
            <AlertCircle className='h-10 w-10' />

            <DialogTitle className={cn("")}>Scanner is Offline</DialogTitle>
          </div>
          <DialogDescription className={cn("text-center text-white!")}>
            The scanner is currently offline.
            <br />
            Please contact the admin if you think this was a mistake!
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            "my-4 rounded-lg p-4 mx-6 bg-red-800 text-center text-white dark:bg-red-950/20"
          )}
        >
          Error!
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScannerOfflineModal;
