// app/add-request/page.tsx
"use client";

import { useRouter } from "next/navigation";
import AddRequestPage from "@/components/incident-form/add-request-page";

const API_BASE = "https://8zo99udgc3.execute-api.us-east-1.amazonaws.com/Prod";

export default function AddRequestContainer() {
  const router = useRouter();

  const onSubmitAccountInfo = async (formData: any) => {
    try {
      const res = await fetch(`${API_BASE}/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error(await res.text());

      const { incidentId } = await res.json();
      router.push(`/verify/${encodeURIComponent(incidentId)}`);
    } catch (e: any) {
      console.error("Create incident failed:", e?.message || e);
      alert("Could not create incident. Check console/logs.");
    }
  };

  return (
    <AddRequestPage
      onSubmitAccountInfo={onSubmitAccountInfo}
      onDeferToPlatform={() => {}}
    />
  );
}
