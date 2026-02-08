import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { HeaderWithProjectSelector } from "@/components/header-with-project-selector";
import { LayoutDashboard, MessageSquare, FileText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import "./globals.css";

function SidebarPlaceholder() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border flex flex-row items-center gap-2 px-2 py-2">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="Bild" className="size-7 shrink-0 object-contain" />
          <span className="font-bold text-sidebar-foreground truncate">Bild</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/"><LayoutDashboard className="size-4" /><span>Home</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/chat"><MessageSquare className="size-4" /><span>Chat</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/files"><FileText className="size-4" /><span>Files</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bild — Supervisor Dashboard",
  description:
    "Proof-of-work for construction. Real-time project status and proof viewer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <SidebarProvider>
          <Suspense fallback={<SidebarPlaceholder />}>
            <AppSidebar />
          </Suspense>
          <SidebarInset>
            <Suspense fallback={<header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4"><span className="text-sm text-muted-foreground">Supervisor Dashboard</span></header>}>
              <HeaderWithProjectSelector />
            </Suspense>
            <div className="flex-1 overflow-auto">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
