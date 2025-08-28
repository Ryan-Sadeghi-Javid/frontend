// app/sumsub-test/page.tsx
"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

export default function SumsubTestPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);
  const [sdkScriptReady, setSdkScriptReady] = useState(false);

  const log = (...a: any[]) => console.log("[SUMSUB]", ...a);

  useEffect(() => {
    if (!sdkScriptReady) return;
    if (startedRef.current) return;
    startedRef.current = true;

    let sdk: any;
    let cancelled = false;

    const fetchToken = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE!}/Prod/sumsub/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            incidentId: "test-standalone",
            firstName: "Ada",
            lastName: "Lovelace",
            emailAddress: "ada@example.com",
          }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      log("fetched token (first 20):", String(data?.token || "").slice(0, 20));
      return data as { token: string };
    };

    const waitFor = (check: () => any, label: string, timeoutMs = 15000) =>
      new Promise<void>((resolve, reject) => {
        const t0 = Date.now();
        const loop = () => {
          if (cancelled) return reject(new Error("cancelled"));
          try {
            if (check()) return resolve();
          } catch {}
          if (Date.now() - t0 > timeoutMs) return reject(new Error(`${label} timeout`));
          setTimeout(loop, 100);
        };
        loop();
      });

    (async () => {
      try {
        const { token } = await fetchToken();

        // Wait for global exposed by the SDK script
        log("waiting for window.snsWebSdk …");
        await waitFor(() => (window as any).snsWebSdk?.init, "snsWebSdk");

        const SDK: any = (window as any).snsWebSdk;

        const updateAccessToken = async () => {
          const fresh = await fetchToken();
          return fresh.token;
        };

        sdk = SDK
          .init(token, updateAccessToken)
          .withConf({ lang: "en" })
          .withOptions({ addViewportTag: true, adaptIframeHeight: true })
          .on("idCheck.onReady", () => log("SDK ready"))
          .on("idCheck.onError", (e: any) => console.error("[SUMSUB] idCheck.onError", e))
          .on("error", (e: any) => console.error("[SUMSUB] generic error", e))
          .build();

        sdk.launch("#sumsub-websdk-container");
        log("SDK launched");
      } catch (e: any) {
        console.error("[SUMSUB] init failed:", e?.message || e);
        if (containerRef.current) {
          containerRef.current.textContent = "Couldn’t start verification. Check console.";
        }
      }
    })();

    return () => {
      cancelled = true;
      try { sdk?.destroy?.(); } catch {}
    };
  }, [sdkScriptReady]);

  return (
    <>
      {/* Load the official SDK from Sumsub (needed for window.snsWebSdk) */}
      <Script
        id="sumsub-sdk"
        src="https://in.sumsub.com/websdk/p/txedwvnT9I7IUXU7"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("[SUMSUB] sdk script loaded");
          setSdkScriptReady(true);
        }}
        onError={() => console.error("[SUMSUB] failed to load sdk script")}
      />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl mb-4">Identity verification (test)</h1>
        <div
          ref={containerRef}
          id="sumsub-websdk-container"
          className="w-full min-h-[720px] border rounded"
          style={{ display: "block" }}
        />
      </div>
    </>
  );
}