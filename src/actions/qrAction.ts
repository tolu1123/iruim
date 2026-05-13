"use server";

import { createClient } from "@/lib/supabase/server";

const botUrl = process.env.WHATSAPP_BOT_URL!;
const botSecret = process.env.BOT_SECRET!

async function sendInvitationCard(phoneNo: string, qrUrl: string) {
  try {
    const supabase = await createClient();

    const { data, error: sessionError } = await supabase.auth.getClaims();
    const user = data?.claims;
    if (!user || sessionError) throw new Error("Failed to get user token");

    // Check if phoneNo starts with a plus symbol, if it does remove it.
    const formattedPhoneNo = phoneNo.startsWith("+")
      ? phoneNo.slice(1)
      : phoneNo;
    // Make a post request to our whatsapp bot to send the whatsapp number the invitation card
    const res = await fetch(`${botUrl}/send-media`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNo: formattedPhoneNo,
        mediaUrl: qrUrl,
      }),
    });

    if (!res.ok) {
      const msg = await res.json();
      throw new Error(
        `Failed to send invitation card, status: ${res.status}, error: ${msg.error}`
      );
    }

    const response = await res.json();

    if (response.success !== true) {
      throw new Error(`Failed to send invitation card`);
    }

    // Update the guest_cards table with Sent
    const { error } = await supabase
      .from("guest_cards")
      .update({
        QRSentStatus: "Sent",
      })
      .eq("qr_code_url", qrUrl);

    if (error) {
      throw new Error(`Failed to update the QR status column`);
    }

    return {
      error: false,
      message: `Invitation Card sent successfully to ${phoneNo}`,
    };
  } catch (error) {
    return {
      error: true,
      message: (error as Error).message,
    };
  }
}

async function sendInvitationCardToPlusOne(phoneNo: string, qrUrl: string) {
  try {
    const supabase = await createClient();

    const { data, error: sessionError } = await supabase.auth.getClaims();
    const user = data?.claims;
    if (!user || sessionError) throw new Error("Failed to get user");

    // Check if phoneNo starts with a plus symbol, if it does remove it.
    const formattedPhoneNo = phoneNo.startsWith("+")
      ? phoneNo.slice(1)
      : phoneNo;
    // Make a post request to our whatsapp bot to send the whatsapp number the invitation card
    const res = await fetch(`${botUrl}/send-media-plus-one`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNo: formattedPhoneNo,
        mediaUrl: qrUrl,
      }),
    });

    if (!res.ok) {
      const msg = await res.json();
      throw new Error(
        `Failed to send invitation card, status: ${res.status}, error: ${msg.error}`
      );
    }

    const response = await res.json();

    if (response.success !== true) {
      throw new Error(`Failed to send invitation card`);
    }

    // Update the guest_cards table with Sent
    const { error } = await supabase
      .from("guest_cards")
      .update({
        QRSentStatus: "Sent",
      })
      .eq("qr_code_url", qrUrl);

    if (error) {
      throw new Error(`Failed to update the QR status column`);
    }

    return {
      error: false,
      message: `Invitation Card sent successfully to ${phoneNo}`,
    };
  } catch (error) {
    return {
      error: true,
      message: (error as Error).message,
    };
  }
}

export { sendInvitationCard, sendInvitationCardToPlusOne };
