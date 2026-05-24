import { Store, ShoppingBag, Wallet, Clock } from "lucide-react";
import { StatCard } from "@/components/cards/stat-card";

export default function SellerPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Listing Aktif" value="12" desc="Akun ML dipublish" icon={Store} />
      <StatCard title="Order Masuk" value="5" desc="Butuh diproses" icon={ShoppingBag} />
      <StatCard title="Saldo Tertahan" value="Rp 1.450.000" desc="Menunggu selesai" icon={Clock} />
      <StatCard title="Bisa Dicairkan" value="Rp 830.000" desc="Siap withdraw" icon={Wallet} />
    </div>
  );
}