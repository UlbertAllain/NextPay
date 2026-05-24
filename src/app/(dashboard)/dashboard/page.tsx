"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShoppingBag, Wallet, Clock } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { getOrdersByUserId } from "@/services/order-service";
import { Order } from "@/types/order";
import { formatRupiah } from "@/lib/format";

import { StatCard } from "@/components/cards/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { firebaseUser } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!firebaseUser) return;

      try {
        setLoading(true);
        const data = await getOrdersByUserId(firebaseUser.uid);
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [firebaseUser]);

  const activeOrders = orders.filter(
    (order) =>
      order.status === "pending_payment" ||
      order.status === "paid" ||
      order.status === "processing"
  );

  const successfulOrders = orders.filter((order) => order.status === "success");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Order"
          value={`${orders.length}`}
          desc="Semua transaksi"
          icon={ShoppingBag}
        />
        <StatCard
          title="Order Aktif"
          value={`${activeOrders.length}`}
          desc="Sedang diproses"
          icon={Clock}
        />
        <StatCard
          title="Saldo Wallet"
          value="Rp 0"
          desc="Belum aktif"
          icon={Wallet}
        />
        <StatCard
          title="Order Sukses"
          value={`${successfulOrders.length}`}
          desc="Transaksi selesai"
          icon={ShieldCheck}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Memuat transaksi...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada transaksi.
            </p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-medium text-slate-950">
                      {order.title}
                    </p>
                    <p className="text-sm capitalize text-slate-500">
                      {order.status.replaceAll("_", " ")}
                    </p>
                  </div>

                  <p className="font-semibold text-slate-950">
                    {formatRupiah(order.totalAmount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 