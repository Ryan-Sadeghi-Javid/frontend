"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";


type TokenResp = { token: string; applicantId?: string | null };


export default function VerifyClient({ incidentId }: { incidentId: string }) {
  const router = useRouter();
  const sdkRef = useRef<any>(null);
  const launchedRef = useRef(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [reviewIsGreen, setReviewIsGreen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const applicantIdRef = useRef<string | null>(null);

  useEffect(() => {
    if ((window as any)?.snsWebSdk?.init) setSdkReady(true);
  }, []);

  useEffect(() => {
    if (!sdkReady || launchedRef.current) return;
    let cancelled = false;

    const fetchToken = async (): Promise<TokenResp> => {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sumsub/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId }),
      });
      if (!r.ok) throw new Error(await r.text());
      return (await r.json()) as TokenResp;
    };

    (async () => {
      try {
        const { token, applicantId } = await fetchToken();
        if (applicantId) applicantIdRef.current = String(applicantId);

        if (cancelled) return;
        const SDK: any = (window as any).snsWebSdk;

        const builder = SDK
          .init(token, async () => (await fetchToken()).token)
          .withConf({ lang: "en" })
          .withOptions({ adaptIframeHeight: true })
          .on("idCheck.onApplicantLoaded", (p: any) => {
            const aid = p?.applicantId || p?.applicant?.id;
            if (aid) applicantIdRef.current = String(aid);
          })
          .on("idCheck.onApplicantStatusChanged", (p: any) => {
            const answer = p?.reviewResult?.reviewAnswer;
            const aid = p?.applicantId || p?.reviewResult?.applicantId || p?.applicant?.id;
            if (aid) applicantIdRef.current = String(aid);
            if (answer === "GREEN") setReviewIsGreen(true);
          })
          .on("error", (e: any) => console.warn("[SUMSUB] SDK error:", e));

        sdkRef.current = builder.build();
        sdkRef.current.launch("#sumsub-websdk-container");
        launchedRef.current = true;
      } catch (e) {
        if (cancelled) return;
        console.error("[SUMSUB] init failed:", e);
        const el = document.getElementById("sumsub-websdk-container");
        if (el) el.textContent = "Couldn’t start verification. Check console.";
      }
    })();

    return () => {
      cancelled = true;
      try { sdkRef.current?.destroy?.(); } catch {}
    };
  }, [sdkReady, incidentId]);

  const onContinue = async () => {
    setSubmitting(true);
    try {
      if (!applicantIdRef.current) {
        try {
          const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sumsub/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ incidentId }),
          });
          if (r.ok) {
            const { applicantId } = (await r.json()) as TokenResp;
            if (applicantId) applicantIdRef.current = String(applicantId);
          }
        } catch {}
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/incidents/${encodeURIComponent(incidentId)}/finalize`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicantId: applicantIdRef.current || undefined }),
        }
      );

      if (res.status === 409) {
        try { sdkRef.current?.destroy?.(); } catch {}
        router.replace("/name-mismatch");
        return;
      }

      if (!res.ok) {
        const t = await res.text();
        console.error("Finalize failed:", t);
        alert("Could not finalize your case. Please try again.");
        setSubmitting(false);
        return;
      }

      try { sdkRef.current?.destroy?.(); } catch {}
      router.replace(`/thank-you?incident=${encodeURIComponent(incidentId)}`);
    } catch (e) {
      console.error("Finalize error:", e);
      alert("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Script
        id="sumsub-sdk"
        src="https://static.sumsub.com/idensic/static/sns-websdk-builder.js"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
        onReady={() => setSdkReady(true)}
        onError={() => console.error("[SUMSUB] sdk script failed to load")}
      />
      <div id="sumsub-websdk-container" className="w-full min-h-[720px] bg-white border rounded-lg" />
      <div className="mt-6 flex justify-end">
        <Button disabled={!reviewIsGreen || submitting} onClick={onContinue}>
          {submitting ? "Submitting…" : "Continue"}
        </Button>
      </div>
    </>
  );
}
