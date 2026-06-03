"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CreditCard,
  Home,
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  User,
  Users,
  Wallet,
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import {
  NotificationItem,
  subscribeNotificationsByUserId,
} from "@/services/notification-service";

type SidebarItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badgeKey?: "notifications";
};

const userItems: SidebarItem[] = [
  { label: "Main Menu", href: "/", icon: Home },
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Pesanan", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { label: "Rekber", href: "/dashboard/rekber", icon: ShieldCheck },
  {
    label: "Notifikasi",
    href: "/dashboard/notifications",
    icon: Bell,
    badgeKey: "notifications",
  },
  { label: "Profil", href: "/dashboard/profile", icon: User },
];

const sellerItems: SidebarItem[] = [
  { label: "Main Menu", href: "/", icon: Home },
  { label: "Overview", href: "/seller", icon: LayoutDashboard },
  { label: "Akun Game", href: "/seller/accounts", icon: Store },
  { label: "Order", href: "/seller/orders", icon: ShoppingBag },
  { label: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { label: "Rekber", href: "/dashboard/rekber", icon: ShieldCheck },
  {
    label: "Notifikasi",
    href: "/dashboard/notifications",
    icon: Bell,
    badgeKey: "notifications",
  },
  { label: "Profil", href: "/dashboard/profile", icon: User },
];

const adminItems: SidebarItem[] = [
  { label: "Main Menu", href: "/", icon: Home },
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Akun-Games", href: "/admin/listings", icon: Store },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Rekber", href: "/admin/rekber", icon: ShieldCheck },
  { label: "Withdrawals", href: "/admin/withdrawals", icon: Wallet },
  {
    label: "Notifikasi",
    href: "/dashboard/notifications",
    icon: Bell,
    badgeKey: "notifications",
  },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const itemMap = {
  user: userItems,
  seller: sellerItems,
  admin: adminItems,
};

type DashboardSidebarProps = {
  role: keyof typeof itemMap;
};

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const { firebaseUser } = useAuth();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const items = itemMap[role];

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((notification) => !notification.read).length;
  }, [notifications]);

  useEffect(() => {
    if (!firebaseUser) {
      setNotifications([]);
      return;
    }

    const unsubscribe = subscribeNotificationsByUserId(
      firebaseUser.uid,
      setNotifications
    );

    return () => unsubscribe();
  }, [firebaseUser]);

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white px-4 py-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-950">NextPay</h1>
        <p className="mt-1 text-xs capitalize text-slate-500">{role} panel</p>
      </div>

      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const badgeCount =
            item.badgeKey === "notifications" ? unreadNotificationCount : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>

              {badgeCount > 0 && (
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}