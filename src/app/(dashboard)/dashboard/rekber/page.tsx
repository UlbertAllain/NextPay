"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import {
  confirmRekberCompleted,
  disputeRekber,
  getRekberByBuyerId,
} from "@/services/rekber-service";
import { RekberTransaction } from "@/types/rekber";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserRekberPage() {
  const { firebaseUser } = useAuth();

  const [items, setItems] = useState<RekberTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  async function loadRekber() {
    if (!firebaseUser) return;

    try {
      setLoading(true);
      const data = await getRekberByBuyerId(firebaseUser.uid);
      setItems(data);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data rekber");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRekber();
  }, [firebaseUser]);

  async function handleConfirm(id: string) {
    try {
      setActionLoadingId(id);
      await confirmRekberCompleted(id);
      await loadRekber();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal mengonfirmasi rekber";

      alert(message);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDispute(id: string) {
    try {
      setActionLoadingId(id);
      await disputeRekber(id);
      await loadRekber();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal membuka dispute";

      alert(message);
    } finally {
      setActionLoadingId(null);
    }
  }

  function getPaymentStatusLabel(item: RekberTransaction) {
    switch (item.paymentStatus) {
      case "paid":
        return "Sudah Dibayar";
      case "expired":
        return "Expired";
      case "refunded":
        return "Refunded";
      case "unpaid":
      default:
        return "Belum Dibayar";
    }
  }

  function getStatusLabel(item: RekberTransaction) {
    return item.status.replaceAll("_", " ");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Transaksi Rekber Saya
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Pantau pembayaran, status dana, konfirmasi akun, dan buka dispute jika
          transaksi bermasalah.
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-slate-500">
            Memuat rekber...
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-slate-500">
            Belum ada transaksi rekber.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const isActionLoading = actionLoadingId === item.id;

            return (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <CardTitle>{item.itemName}</CardTitle>
                      <p className="mt-1 text-sm text-slate-500">
                        Invoice: {item.invoice}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {formatRupiah(item.totalAmount)}
                      </p>
                      <p className="mt-1 text-xs capitalize text-slate-500">
                        Status: {getStatusLabel(item)}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Status Pembayaran
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {getPaymentStatusLabel(item)}
                    </p>
                  </div>

                  {item.status === "waiting_payment" ? (
                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
                      Transaksi masih menunggu pembayaran. Selesaikan pembayaran
                      di halaman mock payment.
                    </div>
                  ) : null}

                  {item.status === "holding_fund" ? (
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                      Dana sudah ditahan oleh NextPay. Menunggu penjual
                      menyerahkan akun.
                    </div>
                  ) : null}

                  {item.status === "waiting_confirmation" ? (
                    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row">
                      <Button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handleDispute(item.id)}
                      >
                        Dispute
                      </Button>

                      <Button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handleConfirm(item.id)}
                      >
                        Konfirmasi Selesai
                      </Button>
                    </div>
                  ) : null}

                  {item.status === "dispute" ? (
                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
                      Transaksi sedang dalam dispute dan menunggu keputusan
                      admin.
                    </div>
                  ) : null}

                  {item.status === "completed" ? (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                      Transaksi sudah selesai.
                    </div>
                  ) : null}

                  {item.status === "refunded" ? (
                    <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-sm text-purple-700">
                      Transaksi sudah direfund ke wallet buyer.
                    </div>
                  ) : null}

                  {item.status === "cancelled" ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      Transaksi dibatalkan.
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}