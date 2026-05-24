"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { UserRole } from "@/types/user";

type AuthGuardProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const { firebaseUser, appUser, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!firebaseUser) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && appUser && !allowedRoles.includes(appUser.role)) {
      router.replace("/dashboard");
    }
  }, [firebaseUser, appUser, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 shadow-sm">
          Memuat sesi...
        </div>
      </div>
    );
  }

  if (!firebaseUser) return null;

  if (allowedRoles && appUser && !allowedRoles.includes(appUser.role)) {
    return null;
  }

  return <>{children}</>;
}