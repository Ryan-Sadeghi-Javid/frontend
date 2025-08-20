"use client";

import type { ReactNode } from "react";
import { LayoutDashboard, FileText, LogOut, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
// ⬇️ NEW: use your existing config file
import { cognitoAuthConfig } from "@/lib/cognitoAuthConfig";

interface DashboardLayoutProps {
  children: ReactNode;
  currentStep?: string;
}

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", id: "dashboard" },
  { name: "Reports", icon: FileText, href: "/reports", id: "reports" },
  { name: "Add Request", icon: PlusSquare, href: "/", id: "add_request" },
  // { name: "Log Off", icon: LogOut, href: "#", id: "logoff" },
];

// ⬇️ NEW: set your Hosted UI domain (from Cognito > App integration)
// e.g. "https://your-domain.auth.us-east-1.amazoncognito.com"
const HOSTED_DOMAIN = "https://us-east-1ec0ypqy93.auth.us-east-1.amazoncognito.com";

export default function DashboardLayout({ children, currentStep }: DashboardLayoutProps) {
  const pathname = usePathname();

  const isAddRequestActive =
    currentStep === "FILLING_ACCOUNT_INFO" ||
    currentStep === "PENDING_ID_VERIFICATION" ||
    currentStep === "ID_VERIFICATION_IN_PROGRESS" ||
    currentStep === "SUBMITTING_INCIDENT" ||
    currentStep === "SHOWING_CONFIRMATION";

  const isActive = (item: (typeof navItems)[number]) => {
    if (item.id === "add_request" && isAddRequestActive) return true;
    if (item.href === "#") return false; // never "active" for logoff
    if (pathname === item.href) return true; // exact match
    if (item.href !== "/" && pathname.startsWith(item.href + "/")) return true; // nested
    if (item.href === "/" && pathname === "/" && !isAddRequestActive) return true; // root
    return false;
  };

  // ⬇️ NEW: sign out at Cognito, then immediately show Hosted UI sign-in
  const handleLogout = () => {
    // optional: clear common local tokens so SPA state doesn't look logged-in
    try {
      const keys = Object.keys(localStorage);
      for (const k of keys) {
        if (
          k.startsWith("oidc.user:") ||
          k.includes("CognitoIdentityServiceProvider") ||
          k.startsWith("amplify-") ||
          k.startsWith("CognitoOAuth2")
        ) {
          localStorage.removeItem(k);
        }
      }
    } catch {}

    const { client_id, redirect_uri, response_type, scope } = cognitoAuthConfig;

    // login URL (Hosted UI)
    const loginUrl =
      `${HOSTED_DOMAIN}/login?client_id=${encodeURIComponent(client_id)}` +
      `&response_type=${encodeURIComponent(response_type)}` +
      `&scope=${encodeURIComponent(scope)}` +
      `&redirect_uri=${encodeURIComponent(redirect_uri)}`;

    // logout URL that bounces straight to the login screen
    const logoutUrl =
      `${HOSTED_DOMAIN}/logout?client_id=${encodeURIComponent(client_id)}` +
      `&logout_uri=${encodeURIComponent(loginUrl)}`;

    window.location.href = logoutUrl;
  };

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="w-64 flex-col border-r bg-white p-6 hidden md:flex">
        <Link href="/" className="flex items-center gap-3 mb-8">
          <Image
            src="/assets/logo.png"
            alt="Astan Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </Link>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item);
            return item.id === "logoff" ? (
              <Button
                key={item.name}
                variant="ghost"
                className={`justify-start text-sm h-10 ${
                  active
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={handleLogout}
                aria-label="Log off"
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            ) : (
              <Button
                key={item.name}
                variant="ghost"
                className={`justify-start text-sm h-10 ${
                  active
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                asChild
                aria-current={active ? "page" : undefined}
              >
                <Link href={item.href}>
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 sticky top-0 z-10" />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
