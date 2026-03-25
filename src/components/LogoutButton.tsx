
"use client";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Ensure the user is redirected even if the session clear fails
      router.push("/login");
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleLogout} 
      className="rounded-full gap-2 border-white/10 hover:bg-white/5 transition-all"
    >
      <LogOut className="size-4" /> Logout
    </Button>
  );
}
