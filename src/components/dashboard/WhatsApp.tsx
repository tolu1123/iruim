"use client";

import {
  useQRStream,
  useQRString,
  useWAStatus,
  WA_STATUS_KEY,
} from "@/lib/whatsapp/whatsApp";
import { Skeleton } from "../ui/skeleton";
import Image from "next/image";
import { useEffect, useState } from "react";

import { BadgeCheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import QRCode from "qrcode";
import { toast } from "sonner";
import { mutate } from "swr";

export default function WhatsApp() {
  const {
    status,
    isLoading: statusLoading,
    isError: statusError,
  } = useWAStatus();

  // only fetch QR if NOT connected
  // const shouldFetchQR = status?.state === "Not connected";

  // const {
  //   qr,
  //   isLoading: qrLoading,
  //   isError: qrError,
  // } = useQRString(shouldFetchQR, token);
  const shouldStream = status?.state.toLowerCase() !== "connected";

  const { qr: qrString, status: streamStatus } = useQRStream(shouldStream);
  // Store generated QR PNG URL
  const [qrImage, setQrImage] = useState<string | null>(null);

  useEffect(() => {
    if (!qrString) {
      setQrImage(null);
      return;
    }
    QRCode.toDataURL(qrString, { errorCorrectionLevel: "H", margin: 2 })
      .then((url: string) => setQrImage(url))
      .catch((err: Error) => console.error("QR generation failed", err));
  }, [qrString]);

  return (
    <div className='pb-10'>
      <div className=''>
        <h3 className='font-playfair text-3xl font-bold mb-6'>
          WhatsApp Client
        </h3>
        <p className=''>
          This is where you see whether you are connected or not.
        </p>
      </div>

      {/* Make request to whatsapp client and detect if we are connnected */}
      {/* If not connected, make request to get qr-code to make a QRcode */}
      <div className=''>
        {status?.state?.toLowerCase() === "connected" && (
          <Status
            statusObj={{
              status: status.state,
              statusLoading,
              statusError,
            }}
          />
        )}

        {/* Show QR only when not connected */}
        {shouldStream && (
          <div className='mt-4'>
            {(!qrImage || statusLoading) && <Skeleton className='w-40 h-40' />}
            {/* {qrError && <p className='text-red-500'>Failed to load QR</p>} */}

            {qrImage && (
              <Image
                src={qrImage}
                alt='WhatsApp QR'
                width={240}
                height={240}
                className='border rounded p-2 w-60 h-60'
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Status({
  statusObj,
}: {
  statusObj: {
    status: string;
    statusLoading: boolean;
    statusError: boolean;
  };
}) {
  const { status, statusLoading, statusError } = statusObj;

  const loadingComponent = (
    <div className='w-full h-5'>
      <Skeleton className='w-full h-full' />
    </div>
  );
  return (
    <>
      {statusLoading && loadingComponent}
      {statusError && loadingComponent}

      <div className='flex gap-6 my-4'>
        <Badge className='bg-white text-green-800 px-4 py-1 border border-green-800'>
          <BadgeCheckIcon /> {status}
        </Badge>

        {/* Disconnect dialog */}
        <DisconnectWhatsApp />
      </div>
    </>
  );
}

function DisconnectWhatsApp() {
  const handleDisconnect = async () => {
    try {
      const res = await fetch("/api/whatsapp-bot/disconnect-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to disconnect.");
        return;
      }

      await mutate(WA_STATUS_KEY, undefined, {
        revalidate: true,
      });
      toast.success(data.message || "Disconnected successfully!");
    } catch (err) {
      toast.error(`${(err as Error).message}`);
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger className='bg-destructive text-white px-4 py-1! text-sm rounded-full h-fit'>
        Disconnect WhatsApp
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently disconnect your
            account from the bot and remove your session data from the server.{" "}
            <span className='text-destructive font-semibold block my-2'>
              Note: You will not be able to send QR code once you disconnect
              your account from the bot
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDisconnect()}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
