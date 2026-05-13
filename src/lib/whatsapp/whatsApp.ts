// This file is used to organize code that fetches WhatsApp status and WhatsApp QR string for connecting client

import useSWR, { mutate } from "swr";
import { EventSource } from "eventsource";
import { useEffect, useState } from "react";

const hostUrl = process.env.NEXT_PUBLIC_BASE_URL!;
export const WA_STATUS_KEY = [`${hostUrl}/api/whatsapp-bot/getStatus`];

const authFetcher = async (url: string, method = "GET") => {
  return fetch(url, {
    method: method, // your bot uses GET for /status and /getQr
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
};

function useWAStatus() {
  const { data, error, isLoading } = useSWR(
    WA_STATUS_KEY,
    ([url]) => authFetcher(url),
    {
      refreshInterval: 32000,
      dedupingInterval: 30000, // avoids spamming
    },
  ); // I keep refreshing this data at intervals to ensure the page does not get stale

  return {
    status: data,
    isLoading,
    isError: error,
  };
}

function useQRString(shouldFetch: boolean) {
  const { data, error, isLoading } = useSWR(
    shouldFetch ? [`${hostUrl}/api/whatsapp-bot/getQR`] : null,
    ([url]) => authFetcher(url),
    { refreshInterval: 15000, dedupingInterval: 15000 },
  );

  return {
    qr: data,
    isLoading,
    isError: error,
  };
}

// function useQRStream(shouldFetch: boolean, token: string) {
//   const [qr, setQr] = useState<string | null>(null);
//   const [status, setStatus] = useState<string | null>(null);
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     if (!shouldFetch) return;

//     const es = new EventSource(
//       `${process.env.NEXT_PUBLIC_WHATSAPP_BOT_URL}/get-qr-stream`,
//       {
//         fetch: (input, init) =>
//           fetch(input, {
//             ...init,
//             headers: {
//               ...init?.headers,
//               "Content-Encoding": "none",
//             },
//           }),
//       },
//     );

//     es.onopen = () => setIsConnected(true);

//     es.addEventListener("message", async (event) => {
//       const data = JSON.parse(event.data);

//       if (data.type === "qr") {
//         setQr(data.qr);
//       }

//       if (data.type === "ready") {
//         setQr(null); // clear QR once connected
//         setStatus("connected");
//       }

//       if (data.type === "disconnected") {
//         setStatus("not connected");
//         await mutate(WA_STATUS_KEY, undefined, {
//           revalidate: true,
//         });
//       }

//       if (data.type === "ping") {
//         setStatus(data.state);
//       }
//     });

//     es.onerror = async () => {
//       setIsConnected(false);
//       await mutate(WA_STATUS_KEY, undefined, {
//         revalidate: true,
//       });
//     };

//     return () => {
//       es.close();
//     };
//   }, [shouldFetch, token]);

//   return { qr, status, isConnected };
// }

function useQRStream(shouldFetch: boolean) {
  const [qr, setQr] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!shouldFetch) {
      // Clean up state when we stop needing the stream
      setQr(null);
      setStatus(null);
      return;
    }

    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;

    function connect() {
      if (destroyed) return;

      es = new EventSource(
        `${process.env.NEXT_PUBLIC_WHATSAPP_BOT_URL}/get-qr-stream`,
        {
          fetch: (input, init) =>
            fetch(input, {
              ...init,
              headers: {
                ...init?.headers,
                "Content-Encoding": "none",
              },
            }),
        },
      );

      es.onopen = () => setIsConnected(true);

      es.addEventListener("message", async (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "qr") {
          setQr(data.qr);
        }

        if (data.type === "ready") {
          setQr(null);
          setStatus("connected");
          await mutate(WA_STATUS_KEY, { state: "connected" }, { revalidate: false });
        }

        if (data.type === "disconnected") {
          setQr(null);
          setStatus("not connected");
          await mutate(WA_STATUS_KEY, { state: "not connected" }, { revalidate: false });
        }

        if (data.type === "ping") {
          setStatus(data.state);
        }
      });

      es.onerror = () => {
        setIsConnected(false);
        es?.close();
        // Reconnect after 3s instead of immediately hammering the server
        if (!destroyed) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      destroyed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
    };
  // ⚠️ Intentionally NOT including token or any state in deps —
  // we only want to start/stop based on shouldFetch
  }, [shouldFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  return { qr, status, isConnected };
}

export { authFetcher, useWAStatus, useQRStream, useQRString };
