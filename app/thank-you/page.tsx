// app/thank-you/page.tsx
"use client";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clipboard, ClipboardCheck, ExternalLink, Home, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

export default function ThankYouPage() {
  const params = useSearchParams();
  const router = useRouter();
  const incident = params.get("incident") ?? "";
  const [copied, setCopied] = useState(false);

  const title = useMemo(() => (incident ? `Case #${incident} submitted` : "Case submitted"), [incident]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const onCopy = async () => {
    if (!incident) return;
    try {
      await navigator.clipboard.writeText(incident);
      setCopied(true);
    } catch (e) {
    }
  };

  return (
    <DashboardLayout currentStep="SHOWING_CONFIRMATION">
      <div className="mx-auto max-w-2xl p-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Thanks! Your case {incident ? (<span className="font-medium">#{incident}</span>) : null} has been received and is now <span className="font-medium">pending review</span>.
                  </p>
                </div>
              </div>
            </CardHeader>

            {incident ? (
              <CardContent className="pt-0">
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Case ID
                  </Badge>
                  <code className="rounded-md bg-muted px-2 py-1 text-sm">{incident}</code>
                  <Button size="sm" variant="ghost" className="gap-1" onClick={onCopy} aria-label="Copy case ID">
                    {copied ? (
                      <>
                        <ClipboardCheck className="h-4 w-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Clipboard className="h-4 w-4" /> Copy ID
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-6 text-sm text-muted-foreground">
                  <p>
                    You’ll get an email when the review starts or if we need more details. You can track the status anytime from your dashboard.
                  </p>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Button variant="secondary" onClick={() => router.push("/reports")} className="justify-between">
                    View all reports <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/")} className="justify-between">
                    Submit another <PlusCircle className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="pt-0">
                <div className="mt-3 text-sm text-muted-foreground">
                  <p>
                    Your case has been received and is pending review. If you expected to see a case ID, return to the dashboard and open the latest submission.
                  </p>
                </div>
                <Separator className="my-6" />
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => router.push("/reports")}>
                    Go to reports <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/") }>
                    Back to dashboard <Home className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            )}

            <CardFooter className="flex-col items-start gap-1">
              <p className="text-xs text-muted-foreground">
                Need to add more info? You can update the case from the case page, or reply to the confirmation email and it will attach to this case.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
