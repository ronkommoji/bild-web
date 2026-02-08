"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { HeaderWithProjectSelector } from "@/components/header-with-project-selector";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (loading) return;
    if (isLoginPage && user) {
      router.replace("/");
      return;
    }
    if (!isLoginPage && !user) {
      router.replace("/login");
    }
  }, [loading, user, isLoginPage, router]);

  // Login page: no sidebar, just the page content (full width)
  if (isLoginPage) {
    return <div className="min-h-screen flex flex-col">{children}</div>;
  }

  // Not logged in and not on login: show loading until redirect
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Logged in: full app with sidebar and header
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <HeaderWithProjectSelector />
        <div className="flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
