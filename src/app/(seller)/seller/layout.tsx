import { AuthGuard } from "@/components/guards/auth-guard";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";

export default function SellerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthGuard allowedRoles={["seller", "admin", "super_admin"]}>
      <div className="flex min-h-screen bg-slate-50">
        <DashboardSidebar role="seller" />

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar title="Seller Dashboard" />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}