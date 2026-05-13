// app/api/whatsapp-bot/qr-stream/route.ts

export async function GET() {
  const waBackendUrl = process.env.WHATSAPP_BACKEND_URL || "http://localhost:3002";

  const upstream = await fetch(`${waBackendUrl}/get-qr-stream`, {
    headers: {
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("Failed to connect to WhatsApp backend", { status: 502 });
  }

  const reader = upstream.body.getReader();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
    cancel() {
      reader.cancel(); // reader owns the lock, cancel through it
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}