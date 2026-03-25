
"use client";

import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/login");
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-full gap-2">
      <LogOut className="size-4" /> Logout
    </Button>
  );
}
