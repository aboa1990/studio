
"use client";

import { useAuth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { LogOut } from "lucide-react";
import { signOut } from "firebase/auth";

export default function LogoutButton() {
  const router = useRouter();
  const auth = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
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
