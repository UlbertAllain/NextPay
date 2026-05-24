"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";

export function useRedirectIfAuthenticated() {
  const router = useRouter();
  const { firebaseUser, appUser, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser || !appUser) return;

    if (appUser.role === "admin" || appUser.role === "super_admin") {
      router.replace("/admin");
      return;
    }

    if (appUser.role === "seller") {
      router.replace("/seller");
      return;
    }

    router.replace("/dashboard");
  }, [firebaseUser, appUser, loading, router]);
}