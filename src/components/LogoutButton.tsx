
"use client";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return <Button onClick={handleLogout}>Logout</Button>;
}
