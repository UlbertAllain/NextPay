import { AuthGuard } from "@/components/guards/auth-guard";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard allowedRoles={["admin", "super_admin"]}>
      <main className="min-h-screen bg-slate-50 lg:pl-64">
        <DashboardSidebar role="admin" />
        <DashboardTopbar
          title="Admin Panel"
          description="Pantau order, pembayaran, produk, user, dan konfigurasi sistem."
        />
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </AuthGuard>
  );
}