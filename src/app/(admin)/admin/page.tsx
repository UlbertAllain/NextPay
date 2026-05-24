import { Users, ShoppingBag, CreditCard, ShieldCheck } from "lucide-react";
import { StatCard } from "@/components/cards/stat-card";

export default function AdminPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Total User" value="2.481" desc="Akun terdaftar" icon={Users} />
      <StatCard title="Order Hari Ini" value="186" desc="Semua kategori" icon={ShoppingBag} />
      <StatCard title="Payment Pending" value="24" desc="Menunggu Tripay" icon={CreditCard} />
      <StatCard title="Rekber Aktif" value="19" desc="Dana ditahan" icon={ShieldCheck} />
    </div>
  );
}