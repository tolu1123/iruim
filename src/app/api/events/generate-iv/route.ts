import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import qr from "qr-image";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { join } from "path"; // ← built-in
import { cwd } from "process";

import {
  QRProp,
  IDProp,
} from "@/components/event-configuration/CardConfigDialog";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_JWT_SECRET!,
);

export interface TemplateLayout {
  card_dimension: {
    width: number;
    height: number;
  };
  qr: QRProp;
  id: IDProp;
}

// registerFont(join(cwd(), "fonts", "Roboto-Regular.ttf"), { family: "Roboto" });
// registerFont(join(cwd(), "fonts", "Roboto-Bold.ttf"), {
//   family: "Roboto",
//   weight: "bold",
// });

export async function POST(req: Request) {
  try {
    const { eventId, cardTypeId, guestId, templateUrl, templateLayout } =
      await req.json();

    if (!eventId || !guestId) {
      return NextResponse.json(
        { error: "Missing eventId or guestId" },
        { status: 400 },
      );
    }

    GlobalFonts.registerFromPath(
      join(cwd(), "fonts", "Roboto-Regular.ttf"),
      "Roboto",
    );
    GlobalFonts.registerFromPath(
      join(cwd(), "fonts", "Roboto-Bold.ttf"),
      "Roboto",
    );

    const iv = await createPersonalizedIV(
      guestId,
      cardTypeId,
      eventId,
      templateUrl,
      templateLayout,
    );

    if (iv.success === false)
      // IV creation failed
      return NextResponse.json(
        { success: false, message: iv.message },
        { status: 500 },
      );

    const uploadIV = await uploadIVs(iv.buffer, eventId, guestId, cardTypeId);
    if (uploadIV.success === false)
      // IV upload failed
      return NextResponse.json(
        { success: false, message: uploadIV.message },
        { status: 500 },
      );

    // return the iv url
    return NextResponse.json(
      {
        success: true,
        message: "IV generated and uploaded successfully",
        ivUrl: uploadIV.cardUrl,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

async function createPersonalizedIV(
  uuid: string,
  cardTypeId: string,
  eventId: string,
  templateUrl: string,
  templateLayout: TemplateLayout,
) {
  const canvasWidth = Math.ceil(templateLayout.card_dimension.width);
  const canvasHeight = Math.ceil(templateLayout.card_dimension.height);
  const qrSizeW = Math.ceil(templateLayout.qr.width);
  const qrSizeH = Math.ceil(templateLayout.qr.height);
  const qrX = Math.ceil(templateLayout.qr.x);
  const qrY = Math.ceil(templateLayout.qr.y);
  const snX = Math.ceil(templateLayout.id.x);
  const snY = Math.ceil(templateLayout.id.y);
  const snSize = Math.ceil(parseInt(templateLayout.id.fontSize));

  try {
    // Create the Qr code
    // Concatenate the uuid with the base url of the website
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/events/${eventId}`;
    const searchParams = new URLSearchParams("");
    searchParams.append("cardtype", cardTypeId);
    searchParams.append("guestid", uuid);

    // Add support for plus_more's, we will check if uuid is the same as eventId
    //If it is the same, it is a plus_more
    if (uuid === eventId) {
      searchParams.append("plus_more", "true");
    }
    // Add both the cardtypeId and the guestId to the url
    // const
    const qrUrl = url + "?" + searchParams.toString();

    const qrCode = qr.imageSync(qrUrl, { type: "png" });
    // Load the Qr code as an image
    const qrCodeImage = await loadImage(qrCode);

    // Add qr_code to predesigned file
    const ivTemplate = await loadImage(templateUrl);

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");
    if (!canvas.getContext) {
      throw new Error("Canvas element is not supported");
    }
    ctx.drawImage(ivTemplate, 0, 0);
    ctx.drawImage(qrCodeImage, qrX, qrY, qrSizeW, qrSizeH);

    // Append guestId to the card

    //Here we specify fontSize in px
    ctx.font = `bold ${snSize}px Roboto`;
    ctx.textBaseline = "top";
    // const text = ctx.measureText(uuid);
    // const textWidth = text.width;

    // const canvasMidpoint = Math.floor(canvasWidth / 2);
    // const textStart = canvasMidpoint - textWidth / 2;
    ctx.fillText(uuid, snX, snY + 5);

    // Get the image
    const personalizedIV = await canvas.encode("png");
    return {
      success: true,
      message: "Invitation card was created successfully",
      buffer: personalizedIV,
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error)?.message || "Failed to create invitation card",
      buffer: null,
    };
  }
}

// Utility to upload IV TO SUPABASE
async function uploadIVs(
  iv: Buffer | null,
  eventId: string,
  guestId: string,
  cardTypeId: string,
) {
  try {
    // Create a unique name for the file to be stored
    const filePath = `${eventId}/${cardTypeId}-${guestId}.png`;
    const { error: fileStorageError } = await supabase.storage
      .from("invitation-cards")
      .upload(filePath, iv!, {
        contentType: "image/png",
        upsert: true,
      });

    // Clear buffer
    iv = null;

    if (fileStorageError)
      throw new Error(`Failed to upload IV: ${fileStorageError}`);

    const invitationCardUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/invitation-cards/${filePath}`;

    return {
      success: true,
      cardUrl: invitationCardUrl,
      message: "IV upload was successful",
    };
  } catch (error) {
    return {
      success: false,
      cardUrl: false,
      message: (error as Error)?.message || "IV upload failed",
    };
  }
}
