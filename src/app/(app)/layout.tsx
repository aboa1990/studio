
"use client";

import AppSidebar from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Cloud } from "lucide-react";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col flex-1 h-svh overflow-hidden">
        {/* Mobile Header: Only visible on screens smaller than LG (1024px) */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden shrink-0">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-gradient-to-br from-muted/80 to-muted/50 flex items-center justify-center border shadow-inner">
              <Cloud className="size-4 text-foreground fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tighter leading-none">Cloud Office</span>
              <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-0.5">ABOA WORKS</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
