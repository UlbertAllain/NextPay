import { AuthGuard } from "@/components/guards/auth-guard";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";

export default function SellerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard allowedRoles={["seller", "admin", "super_admin"]}>
      <main className="min-h-screen bg-slate-50 lg:pl-64">
        <DashboardSidebar role="seller" />
        <DashboardTopbar
          title="Seller Panel"
          description="Kelola listing akun ML, order, dan pencairan saldo."
        />
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </AuthGuard>
  );
}