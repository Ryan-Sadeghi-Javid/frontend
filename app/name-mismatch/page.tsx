// app/name-mismatch/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Home, PlusCircle, Clipboard, ClipboardCheck } from "lucide-react";

export default function NameMismatchPage() {
  return (
    <DashboardLayout currentStep="PENDING_ID_VERIFICATION">
      <Suspense fallback={<div className="mx-auto max-w-2xl p-6">Loading…</div>}>
        <NameMismatchInner />
      </Suspense>
    </DashboardLayout>
  );
}

function NameMismatchInner() {
  const params = useSearchParams();
  const incident = params.get("incident") ?? "";
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!incident) return;
    try {
      await navigator.clipboard.writeText(incident);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {
      // noop
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <AlertCircle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-2xl">Name mismatch</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                The name on your ID doesn’t match the name you provided. For security, this request can’t continue until the info matches.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {incident ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">Case ID</Badge>
              <code className="rounded-md bg-muted px-2 py-1 text-sm">{incident}</code>
              <Button size="sm" variant="ghost" className="gap-1" onClick={handleCopy} aria-label="Copy case ID">
                {copied ? (<><ClipboardCheck className="h-4 w-4" /> Copied</>) : (<><Clipboard className="h-4 w-4" /> Copy ID</>)}
              </Button>
            </div>
          ) : null}

          <div className="mt-6 space-y-3 text-sm text-muted-foreground">
            <p>
              Make sure your first and last name exactly match what appears on your government-issued ID. If you go by another name, use the legal name that appears on your ID for this step.
            </p>
            <p>When you’re ready, start a fresh request or return to your dashboard.</p>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button onClick={() => router.push("/add-request")} className="justify-between">
              Start new request <PlusCircle className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="secondary" onClick={() => router.push("/")} className="justify-between">
              Back to dashboard <Home className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Need help? Reply to the confirmation email or contact support, and include your case ID so we can assist you quickly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
