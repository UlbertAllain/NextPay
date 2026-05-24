"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { getOrdersByUserId } from "@/services/order-service";
import { Order } from "@/types/order";
import { formatRupiah } from "@/lib/format";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserOrdersPage() {
  const { firebaseUser } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (!firebaseUser) return;

      try {
        setLoading(true);
        const data = await getOrdersByUserId(firebaseUser.uid);
        setOrders(data);
      } catch (error) {
        console.error(error);
        alert("Gagal mengambil order");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [firebaseUser]);

  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pesanan</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Memuat pesanan...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada pesanan.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
  key={order.id}
  href={`/dashboard/orders/${order.id}`}
  className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-blue-500 hover:bg-blue-50 md:flex-row md:items-center"
>
                  <div>
                    <p className="font-semibold text-slate-950">
                      {order.invoice}
                    </p>
                    <p className="text-sm text-slate-500">{order.title}</p>
                    <p className="mt-1 text-xs capitalize text-blue-600">
                      {order.status.replaceAll("_", " ")}
                    </p>
                  </div>

                  <p className="font-bold text-slate-950">
                    {formatRupiah(order.totalAmount)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}