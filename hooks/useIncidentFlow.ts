// hooks/useIncidentFlow.ts
"use client";

import { useState } from "react";
import type { IncidentFormData } from "@/types";
import { initialIncidentFormData } from "@/lib/constants";
import { uploadEvidenceFile } from "@/lib/api/s3-upload";
import { submitIncident } from "@/lib/api/submitIncident";
import { finalizeIncidentVerification } from "@/lib/api/finalizeIncidentVerification";

type AppStep =
  | "SHOWING_HOMEPAGE"
  | "FILLING_ACCOUNT_INFO"
  | "PENDING_ID_VERIFICATION"
  | "DEFER_TO_PLATFORM"
  | "SUBMITTING_INCIDENT"
  | "SHOWING_CONFIRMATION";


export function useIncidentFlow() {
  const [currentStep, setCurrentStep] = useState<AppStep>("SHOWING_HOMEPAGE");
  const [accountInfoData, setAccountInfoData] = useState<IncidentFormData | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /* -------- Start New Report -------- */
  function handleStartReport() {
    setCurrentStep("FILLING_ACCOUNT_INFO");
    setAccountInfoData({ ...initialIncidentFormData });
    setSubmissionError(null);
    setCaseId(null);
  }

  /* -------- Submit Draft Incident -------- */
  async function handleAccountInfoSubmit(data: IncidentFormData) {
    try {
      setAccountInfoData(data);
      setIsLoading(true);
      setSubmissionError(null);

      const evidenceUploads = await Promise.all(
        (data.evidenceFiles ?? []).map((file) => uploadEvidenceFile(file))
      );
      const evidenceFileKeys = evidenceUploads.map((u) => u.fileKey);

      const payloadForApi = {
        ...data,
        evidenceFileKeys,
        evidenceFiles: undefined,
      };

      const { caseId } = await submitIncident(payloadForApi);
      setCaseId(caseId);
      setCurrentStep("PENDING_ID_VERIFICATION");
    } catch (err: any) {
      setSubmissionError(err?.message || "Failed to save draft report.");
      setCurrentStep("FILLING_ACCOUNT_INFO");
    } finally {
      setIsLoading(false);
    }
  }

  /* -------- Defer Option -------- */
  function handleDeferToPlatform() {
    setCurrentStep("DEFER_TO_PLATFORM");
  }

  function handleGoBackFromDefer() {
    setCurrentStep("FILLING_ACCOUNT_INFO");
  }

  /* -------- Finalize Verification (PASS or FAIL) -------- */
  async function handleVerificationComplete(
    success: boolean,
    verificationData?: any
  ) {
    if (!accountInfoData || !caseId) {
      setSubmissionError("Critical error: Missing incident data.");
      setCurrentStep("FILLING_ACCOUNT_INFO");
      return;
    }

    if (!success) {
      setSubmissionError(
        `Identity verification failed${
          verificationData?.reason ? `: ${verificationData.reason}` : ""
        }.`
      );
      setCurrentStep("PENDING_ID_VERIFICATION");
      return;
    }

    setIsLoading(true);
    setSubmissionError(null);
    setCurrentStep("SUBMITTING_INCIDENT");

    try {
      await finalizeIncidentVerification({
        incidentId: caseId,
        verificationId: verificationData?.verificationId || "sim_verified_123",
        result: "PASS",
      });

      setCurrentStep("SHOWING_CONFIRMATION");
    } catch (err: any) {
      setSubmissionError(err?.message || "Verification finalization failed.");
      setCurrentStep("PENDING_ID_VERIFICATION");
    } finally {
      setIsLoading(false);
    }
  }

  return {
    currentStep,
    accountInfoData,
    submissionError,
    caseId,
    isLoading,
    handleStartReport,
    handleAccountInfoSubmit,
    handleDeferToPlatform,
    handleGoBackFromDefer,
    handleVerificationComplete,
  };
}
