"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

import QrScanner from "qr-scanner";
import ResultModal from "./ResultModal";
import useCardNeedsStatus from "@/hooks/useCardNeedsStatus";
import PlusMoreModal from "./PlusMoreModal";

const saveChanges = async (
  guestId: string,
  cardType: string,
  statusObj: Record<string, boolean>,
) => {
  const supabase = createClient();

  const { error: updateError } = await supabase
    .from("guest_cards")
    .update({ status: statusObj })
    .eq("guest_id", guestId)
    .eq("card_type_id", cardType);

  if (updateError) {
    toast.error("There was an error saving changes, Please try again.");
    return false;
  }

  // Success
  toast.success("Changes saved successfully.");
  return true;
};

const QRScanner = ({
  eventId,
  cardNeeds,
}: {
  eventId: string;
  cardNeeds: {
    card_type_id: string;
    name: string;
    is_active: boolean;
  }[];
}) => {
  const cardNeedsStatus = useCardNeedsStatus(eventId, cardNeeds);
  // @ts-expect-error Using an old library without types
  const scanner = useRef();
  const videoEl = useRef<HTMLVideoElement | null>(null);
  // const qrBoxEl = useRef(null);
  const [qrOn, setQrOn] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPlusMoreModal, setShowPlusMoreModal] = useState(false);
  const [initialStatus, setInitialStatus] = useState<Record<string, boolean>>(
    {},
  );
  const [statusResult, setStatusResult] = useState<Record<
    string,
    boolean
  > | null>(null);
  const [plusMoreStatus, setPlusMoreStatus] = useState<string | null>(null);

  const [guestId, setGuestId] = useState<string | null>(null);
  const [cardType, setCardType] = useState<string | null>(null);
  const [guestTitle, setGuestTitle] = useState<string>("");

  const supabase = createClient();

  const holdOn = useRef(false);

  // Success
  const onScanSuccess = async (result: {
    data: string;
    cornerPoints: { x: number; y: number }[];
  }) => {
    try {
      if (holdOn.current) return;

      holdOn.current = true;
      // Extract the code from the url before checking in
      const url = new URL(result?.data || "");
      const urlString = new URLSearchParams(url.search);
      const cardType = urlString.get("cardtype");
      const guestId = urlString.get("guestid");

      // Check for a special flag for plus_more and apply that to only plus_more
      // (But the cardType must always have only one status to check for)
      if (urlString.has("plus_more", "true")) {
        // Get the one status for the cardType
        const { data: singleStatus, error: singleStatusError } = await supabase
          .from("card_needs")
          .select("name, is_active")
          .eq("card_type_id", cardType)
          .single();

        if (singleStatusError || !singleStatus) {
          toast.error("There was an error validating QR code.");
          holdOn.current = false;
          return;
        }

        // If scanning this specific card is disabled, we tell the user that
        if (singleStatus.is_active === false) {
          toast.error(
            "Scanning this specific card has been disabled, contact admin!!",
          );
          holdOn.current = false;
          return;
        }

        // Fetch the status
        const { data: plusMoreCount, error: plusMoreCountError } =
          await supabase
            .from("guest_cards")
            .select("status")
            .eq("guest_id", guestId)
            .eq("card_type_id", cardType)
            .single();

        if (plusMoreCountError) {
          toast.error("There was an error fetching extra guests details.");
          holdOn.current = false;
          return;
        }

        // Reduce the count of the checked_in plus_more guests
        if (
          plusMoreCount === null ||
          !("status" in plusMoreCount) ||
          !("count" in plusMoreCount.status) ||
          plusMoreCount.status.count < 1
        ) {
          holdOn.current = false;
          return;
        }

        const { error: updatingPlusMoreCountError } = await supabase
          .from("guest_cards")
          .update({
            status: {
              count: parseInt(plusMoreCount.status.count) - 1,
            },
          })
          .eq("guest_id", guestId)
          .eq("card_type_id", cardType);

        if (updatingPlusMoreCountError) {
          toast.error("There was an error updating extra guests details.");
          holdOn.current = false;
          return;
        }

        // Do some setState and
        // Display the dialog (using the status in a sentence) telling the plus_more guest that they have been checked in
        setShowPlusMoreModal(true);
        setPlusMoreStatus(singleStatus.name);
        setGuestTitle("Guest");

        return;
      }

      // If "affiliation_description" is in the event table, collect it and process it and present it
      const { data: guestEventData, error: guestEventError } = await supabase
        .from(`event_${eventId}_attendees`)
        .select("*")
        .eq("id", guestId)
        .single();

      if (guestEventError || !guestEventData) {
        toast.error("There was an error fetching user details");
        holdOn.current = false;
        return;
      }

      if ("affiliation_description" in guestEventData) {
        let guestDescription = "";

        if (
          guestEventData["affiliation_description"]?.includes(
            "member of Platinum 24",
          )
        ) {
          guestDescription = "Platinum Member";
        } else if (
          guestEventData["affiliation_description"]?.includes(
            "member of the ExCo of Ibadan Golf Club",
          )
        ) {
          guestDescription = "IGC Executive";
        } else if (
          guestEventData["affiliation_description"]?.includes(
            "honourary invitation",
          )
        ) {
          guestDescription = "IGC Member";
        } else {
          guestDescription = "Guest";
        }

        setGuestTitle(guestDescription);
      }

      setGuestId(guestId);
      setCardType(cardType);
      //Get status Object
      const { data: statusObj, error: statusError } = await supabase
        .from("guest_cards")
        .select("status")
        .eq("guest_id", guestId)
        .eq("card_type_id", cardType)
        .single();

      if (statusError) {
        toast.error("There was an error validating QR code.");
        holdOn.current = false;
        return;
      }

      if (statusObj === null || !("status" in statusObj)) {
        holdOn.current = false;
        return;
      }

      // Display the modal
      setShowModal(true);
      setInitialStatus(statusObj.status); // ← set the initial status to be used in result modal
      // Set the status result
      setStatusResult(statusObj.status!);
    } catch (error) {
      holdOn.current = false;
      return;
    }
  };

  // Fail
  const onScanFail = (err: string) => {
    // Make it fail silently
    // console.log(err, "fail");
  };

  useEffect(() => {
    if (videoEl?.current && !scanner.current) {
      // 👉 Instantiate the QR Scanner
      // @ts-expect-error Using an old library without types
      scanner.current = new QrScanner(videoEl?.current, onScanSuccess, {
        onDecodeError: onScanFail,
        // maxScansPerSecond: 1,
        // 📷 This is the camera facing mode. In mobile devices, "environment" means back camera and "user" means front camera.
        preferredCamera: "environment",
        // 🖼 This will help us position our "QrFrame.svg" so that user can only scan when qr code is put in between our QrFrame.svg.
        highlightScanRegion: true,
        // 🔥 This will produce a yellow (default color) outline around the qr code that we scan, showing a proof that our qr-scanner is scanning that qr code.
        highlightCodeOutline: true,
        // 📦 A custom div which will pair with "highlightScanRegion" option above 👆. This gives us full control over our scan region.
        // overlay: qrBoxEl?.current || undefined,
      });

      // 🚀 Start QR Scanner
      scanner?.current
        // @ts-expect-error Using an old library without types
        ?.start()
        .then(() => setQrOn(true))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((err: any) => {
          if (err) setQrOn(false);
        });
    }

    // 🧹 Clean up on unmount.
    // 🚨 This removes the QR Scanner from rendering and using camera when it is closed or removed from the UI.
    return () => {
      if (!videoEl?.current) {
        // @ts-expect-error Using an old library without types
        scanner?.current?.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!scanner.current) return;

    if (!showModal) {
      holdOn.current = false;
    }
  }, [showModal]);

  // ❌ If "camera" is not allowed in browser permissions, show an alert.
  useEffect(() => {
    console.log("QR On State: ", qrOn);
    if (!qrOn)
      alert(
        "Camera is blocked or not accessible. Please allow camera in your browser permissions and Reload.",
      );
  }, [qrOn]);

  return (
    <div className='qr-reader w-full h-full m-[0_auto] relative'>
      {/* QR */}
      <video ref={videoEl} className='w-full h-full object-cover'></video>

      <CanvasOverlay className='absolute inset-0 w-full h-full' />
      {statusResult !== null && (
        <ResultModal
          open={showModal}
          onOpenChange={setShowModal}
          initialStatusObj={initialStatus}
          statusObj={statusResult}
          setStatusObj={setStatusResult}
          guestId={guestId!}
          cardType={cardType!}
          saveChanges={saveChanges}
          cardNeedsStatus={cardNeedsStatus}
          guestTitle={guestTitle}
        />
      )}
      {plusMoreStatus !== null && (
        <PlusMoreModal
          open={showPlusMoreModal}
          onOpenChange={setShowPlusMoreModal}
          statusObj={plusMoreStatus}
          guestTitle={guestTitle}
        />
      )}
    </div>
  );
};

export default QRScanner;

const CanvasOverlay = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const width = parent.clientWidth;
      const height = parent.clientHeight;

      canvas.width = width;
      canvas.height = height;

      // If ctx is null, return
      if (!ctx) return;

      ctx.fillStyle = "rgb(0 0 0 / 50%)";
      ctx.fillRect(0, 0, width, height);

      const mobileConstraint = 768;
      const largeScreens = 1024;
      const isMobile = width < mobileConstraint;
      const isLargeScreeens = width >= largeScreens;
      const qrBoxSize = isMobile
        ? width * 0.7
        : isLargeScreeens
          ? width * 0.35
          : width * 0.5;
      const qrBoxX = width / 2 - qrBoxSize / 2;
      const qrBoxY = height / 2 - qrBoxSize / 2;

      ctx.fillStyle = "rgb(0 0 0 / 0%)";
      ctx.clearRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
    };

    // ResizeObserver to track parent size changes
    const observer = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }

    // Initial draw
    resizeCanvas();

    return () => {
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
};
