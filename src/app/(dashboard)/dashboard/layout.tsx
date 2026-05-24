import { AuthGuard } from "@/components/guards/auth-guard";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard allowedRoles={["user", "seller", "admin", "super_admin"]}>
      <main className="min-h-screen bg-slate-50 lg:pl-64">
        <DashboardSidebar role="user" />
        <DashboardTopbar
          title="Dashboard"
          description="Kelola transaksi, wallet, dan aktivitas akun."
        />
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </AuthGuard>
  );
}