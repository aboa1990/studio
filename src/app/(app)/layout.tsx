
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppSidebar from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Cloud, Loader2 } from "lucide-react";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push("/login");
      } else if (event === 'SIGNED_IN') {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="h-svh w-full flex flex-col items-center justify-center gap-4 bg-background">
        <div className="size-14 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-2xl animate-pulse">
          <Cloud className="size-7 fill-current" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground animate-pulse leading-none">Cloud Office</span>
          <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">ABOA WORKS</span>
        </div>
      </div>
    );
  }

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
          <div className="min-h-full flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            
            <footer className="mt-20 pt-8 pb-6 border-t border-white/5">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-lg bg-muted/30 flex items-center justify-center border border-white/5 shadow-inner">
                    <Cloud className="size-3 fill-current" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black tracking-tighter leading-none">Cloud Office</span>
                    <span className="text-[6px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] leading-none mt-0.5 italic">Professional Document Suite</span>
                  </div>
                </div>
                <div className="flex flex-col items-center sm:items-end gap-1">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-30">
                    &copy; {new Date().getFullYear()} ABOA WORKS. ALL RIGHTS RESERVED.
                  </p>
                  <p className="text-[7px] font-medium text-muted-foreground/20 uppercase tracking-widest">
                    Crafted for excellence in business administration.
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
