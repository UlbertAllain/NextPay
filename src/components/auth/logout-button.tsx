"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { logoutUser } from "@/services/auth-service";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await logoutUser();
    router.replace("/login");
  }

  return (
    <Button variant="ghost" onClick={handleLogout} className="gap-2">
      <LogOut size={16} />
      Keluar
    </Button>
  );
}