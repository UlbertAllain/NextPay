import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  ShieldCheck,
  User,
  Package,
  CreditCard,
  Settings,
  Users,
  Store,
} from "lucide-react";

type SidebarItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const userItems: SidebarItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Pesanan", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { label: "Rekber", href: "/dashboard/rekber", icon: ShieldCheck },
  { label: "Profil", href: "/dashboard/profile", icon: User },
];

const sellerItems: SidebarItem[] = [
  { label: "Overview", href: "/seller", icon: LayoutDashboard },
  { label: "Akun ML", href: "/seller/accounts", icon: Store },
  { label: "Order", href: "/seller/orders", icon: ShoppingBag },
  { label: "Withdraw", href: "/seller/withdraw", icon: Wallet },
];

const adminItems: SidebarItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Rekber", href: "/admin/rekber", icon: ShieldCheck },
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
  const items = itemMap[role];

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
          N
        </div>
        <div>
          <p className="font-bold text-slate-950">NextPay</p>
          <p className="text-xs capitalize text-slate-500">{role} panel</p>
        </div>
      </div>

      <nav className="space-y-1 px-3 py-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}