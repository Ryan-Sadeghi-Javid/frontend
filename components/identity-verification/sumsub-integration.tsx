// app/verify/[incidentId]/page.tsx
"use client";

import Script from "next/script";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage({ params }: { params: { incidentId: string } }) {
  const router = useRouter();

  useEffect(() => {
    let sdk: any;
    let cancelled = false;

    const fetchToken = async () => {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL!}/Prod/sumsub/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId: params.incidentId }),
      });
      if (!r.ok) throw new Error(await r.text());
      return (await r.json()) as { token: string };
    };

    const waitForSdk = () =>
      new Promise<void>((resolve, reject) => {
        const t0 = Date.now();
        const tick = () => {
          if (cancelled) return reject(new Error("cancelled"));
          if ((window as any).snsWebSdk?.init) return resolve();
          if (Date.now() - t0 > 15000) return reject(new Error("snsWebSdk timeout"));
          setTimeout(tick, 100);
        };
        tick();
      });

    (async () => {
      try {
        const { token } = await fetchToken();
        await waitForSdk();

        const SDK: any = (window as any).snsWebSdk;
        const updateAccessToken = async () => (await fetchToken()).token;

        sdk = SDK
          .init(token, updateAccessToken)
          .withConf({ lang: "en" })
          .withOptions({ addViewportTag: true, adaptIframeHeight: true })
          .on("idCheck.onApplicantStatusChanged", (p: any) => {
            const answer = p?.reviewResult?.reviewAnswer;
            if (answer === "GREEN") {
              router.replace(`/thank-you?incident=${params.incidentId}`);
            }
          })
          .build();

        sdk.launch("#sumsub-websdk-container");
      } catch (e: any) {
        console.error("[SUMSUB] init failed:", e?.message || e);
        const el = document.getElementById("sumsub-websdk-container");
        if (el) el.textContent = "Couldn’t start verification. Check console.";
      }
    })();

    return () => { cancelled = true; try { sdk?.destroy?.(); } catch {} };
  }, [params.incidentId, router]);

  return (
    <>
      <Script
        id="sumsub-sdk"
        src="https://static.sumsub.com/idensic/static/sns-websdk-builder.js"
        strategy="afterInteractive"
      />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl mb-4">Identity verification</h1>
        <div id="sumsub-websdk-container" className="w-full min-h-[720px] border rounded" />
      </div>
    </>
  );
}
