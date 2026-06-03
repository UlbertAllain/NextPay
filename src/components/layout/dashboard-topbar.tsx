"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";
import { Bell } from "lucide-react";
type DashboardTopbarProps = {
  title: string;
  description?: string;
};

export function DashboardTopbar({ title, description }: DashboardTopbarProps) {
  const { appUser, firebaseUser } = useAuth();

  const displayName =
    appUser?.name || firebaseUser?.displayName || "User NextPay";

  const email = appUser?.email || firebaseUser?.email || "-";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 lg:px-8">
        <div>
          <h1 className="text-lg font-semibold text-slate-950">{title}</h1>
          {description ? (
            <p className="text-sm text-slate-500">{description}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium text-slate-950">{displayName}</p>
            <p className="text-xs text-slate-500">{email}</p>
            <p className="text-xs capitalize text-slate-400">
  {appUser?.role ?? "user"}
</p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}