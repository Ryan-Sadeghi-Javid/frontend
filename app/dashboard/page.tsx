"use client"

import { useAuth } from "react-oidc-context"
import DashboardLayout from "@/components/layout/dashboard-layout"
import DashboardPage from "@/components/dashboard/dashboard-page"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const auth = useAuth()

  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (auth.error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{auth.error.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <div className="bg-white p-8 rounded-lg shadow-lg border max-w-md">
          <AlertCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You must be signed in to view the dashboard.</p>
          <Button onClick={() => auth.signinRedirect()} className="w-full">
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout currentStep="dashboard">
      <DashboardPage />
    </DashboardLayout>
  )
}
