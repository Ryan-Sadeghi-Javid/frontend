// SERVER COMPONENT (no "use client")
import DashboardLayout from "@/components/layout/dashboard-layout";
import VerifyClient from "@/components/verify/VerifyClient";

// In Next 15, params is a Promise in RSC. Await it here.
export default async function IdentityVerificationPage(
  { params }: { params: Promise<{ incidentId: string }> }
) {
  const { incidentId } = await params;

  return (
    <DashboardLayout currentStep="PENDING_ID_VERIFICATION">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Identity verification</h1>
        <VerifyClient incidentId={incidentId} />
      </div>
    </DashboardLayout>
  );
}
