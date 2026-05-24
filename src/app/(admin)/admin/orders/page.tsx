"use client";

import { useEffect, useState } from "react";

import { getAllOrders } from "@/services/order-service";
import { fulfillTopupOrder } from "@/services/fulfillment-service";

import { Order } from "@/types/order";
import { formatRupiah } from "@/lib/format";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil order");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleFulfillTopup(orderId: string) {
    try {
      await fulfillTopupOrder(orderId);
      await loadOrders();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Gagal proses topup");
    }
  }

  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>Semua Order</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Memuat order...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada order.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-3 pr-4 font-medium">Invoice</th>
                    <th className="py-3 pr-4 font-medium">Produk</th>
                    <th className="py-3 pr-4 font-medium">Tipe</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Payment</th>
                    <th className="py-3 pr-4 font-medium">Total</th>
                    <th className="py-3 pr-4 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100">
                      <td className="py-4 pr-4 font-medium text-slate-950">
                        {order.invoice}
                      </td>

                      <td className="py-4 pr-4">{order.title}</td>

                      <td className="py-4 pr-4 capitalize">{order.type}</td>

                      <td className="py-4 pr-4">
                        <StatusBadge value={order.status} />
                      </td>

                      <td className="py-4 pr-4 capitalize">
                        {order.paymentStatus}
                      </td>

                      <td className="py-4 pr-4 font-semibold">
                        {formatRupiah(order.totalAmount)}
                      </td>

                      <td className="py-4 pr-4">
                        {order.type === "topup" &&
                        order.paymentStatus === "paid" &&
                        order.status !== "success" ? (
                          <Button
                            variant="secondary"
                            onClick={() => handleFulfillTopup(order.id)}
                          >
                            Proses Topup
                          </Button>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function StatusBadge({ value }: { value: string }) {
  return (
    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-700">
      {value.replaceAll("_", " ")}
    </span>
  );
}   