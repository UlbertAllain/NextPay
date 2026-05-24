"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/constants/collections";
import { Order } from "@/types/order";
import { formatRupiah } from "@/lib/format";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const snapshot = await getDoc(doc(db, COLLECTIONS.ORDERS, params.id));

        if (snapshot.exists()) {
          setOrder({
            id: snapshot.id,
            ...snapshot.data(),
          } as Order);
        }
      } catch (error) {
        console.error(error);
        alert("Gagal mengambil detail order");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [params.id]);

  if (loading) {
    return <p className="text-sm text-slate-500">Memuat order...</p>;
  }

  if (!order) {
    return <p className="text-sm text-slate-500">Order tidak ditemukan.</p>;
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Detail Order</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Row label="Invoice" value={order.invoice} />
          <Row label="Produk" value={order.title} />
          <Row label="Tipe" value={order.type} />
          <Row label="Status Order" value={order.status.replaceAll("_", " ")} />
          <Row
            label="Status Payment"
            value={order.paymentStatus.replaceAll("_", " ")}
          />
          <Row label="Subtotal" value={formatRupiah(order.amount)} />
          <Row label="Admin Fee" value={formatRupiah(order.adminFee)} />

          <div className="flex justify-between border-t border-slate-200 pt-4">
            <span className="text-slate-500">Total</span>
            <span className="font-bold text-slate-950">
              {formatRupiah(order.totalAmount)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Pembayaran</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-2xl bg-slate-50 p-4 text-sm">
            <p className="text-slate-500">Payment Reference</p>
            <p className="mt-1 break-all font-medium text-slate-950">
              {order.paymentReference || "-"}
            </p>
          </div>

          {order.paymentStatus === "unpaid" && order.paymentCheckoutUrl ? (
            <Button
              className="h-11 w-full"
              onClick={() => {
                window.location.href = order.paymentCheckoutUrl!;
              }}
            >
              Bayar Sekarang
            </Button>
          ) : null}

          {order.paymentStatus === "paid" ? (
            <div className="rounded-2xl bg-green-50 p-4 text-sm font-medium text-green-700">
              Pembayaran sudah diterima.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium capitalize text-slate-950">
        {value}
      </span>
    </div>
  );
}