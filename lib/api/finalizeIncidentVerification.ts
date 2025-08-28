// lib/api/finalizeIncidentVerification.ts
import { getAccessToken } from "@/lib/auth";

export async function finalizeIncidentVerification({
  incidentId,
  verificationId,
  result, // "PASS" or "FAIL"
}: {
  incidentId: string;
  verificationId: string;
  result: "PASS" | "FAIL";
}) {
  const token = await getAccessToken();

  const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/incidents/${incidentId}/verify`

  const response = await fetch(endpoint, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ verificationId, result }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to finalize verification");
  }

  const data = await response.json();
  return data;
}