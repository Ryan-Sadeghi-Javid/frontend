// app/verify/[incidentId]/page.tsx
import DashboardLayout from "@/components/layout/dashboard-layout";
import VerifyClient from "@/components/verify/VerifyClient";

// Server wrapper; gets { params } and keeps the sidebar/layout.
export default async function VerifyPage({
  params,
}: {
  params: Promise<{ incidentId: string }>;
}) {
  const { incidentId } = await params;

  return (
    <DashboardLayout currentStep="PENDING_ID_VERIFICATION">
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Identity verification</h1>
        <p className="text-sm text-muted-foreground">
          Please complete verification to continue with your report.
        </p>

        {/* The SDK renders inside this content area, not full page */}
        <VerifyClient incidentId={incidentId} />
      </div>
    </DashboardLayout>
  );
}
