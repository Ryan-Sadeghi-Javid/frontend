"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SumSubIntegration from "@/components/identity-verification/sumsub-integration";
import { finalizeIncidentVerification } from "@/lib/api/finalizeIncidentVerification";

export default function VerifyPage({ params }: { params: Promise<{ incidentId: string }> }) {
  const router = useRouter();
  const { incidentId } = use(params); // ✅ unwrap the promise

  const [error, setError] = useState<string | null>(null);

  const handleVerificationComplete = async (success: boolean, verificationData?: any) => {
    try {
      await finalizeIncidentVerification({
        incidentId,
        verificationId: verificationData?.verificationId || "simulated",
        result: success ? "PASS" : "FAIL",
      });

      router.push("/reports");
    } catch (err: any) {
      setError(err.message || "Failed to finalize verification");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {error && (
        <p className="text-red-500 mb-4 text-center text-sm">
          {error}
        </p>
      )}
      <SumSubIntegration onVerificationComplete={handleVerificationComplete} />
    </div>
  );
}