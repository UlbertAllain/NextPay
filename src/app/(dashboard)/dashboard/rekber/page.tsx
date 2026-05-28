"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/components/providers/auth-provider";
import {
  confirmRekberCompleted,
  disputeRekber,
  getRekberByBuyerId,
} from "@/services/rekber-service";
import { RekberTransaction } from "@/types/rekber";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "waiting_payment":
      return "bg-slate-100 text-slate-700";
    case "holding_fund":
      return "bg-blue-50 text-blue-700";
    case "waiting_confirmation":
      return "bg-orange-50 text-orange-700";
    case "completed":
      return "bg-green-50 text-green-700";
    case "dispute":
      return "bg-red-50 text-red-700";
    case "refunded":
      return "bg-purple-50 text-purple-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getBuyerStatusText(status: string) {
  switch (status) {
    case "waiting_payment":
      return "Menunggu pembayaran";
    case "holding_fund":
      return "Dana sudah ditahan. Menunggu seller mengirim item.";
    case "waiting_confirmation":
      return "Seller sudah mengirim item. Silakan cek dan konfirmasi.";
    case "completed":
      return "Transaksi selesai.";
    case "dispute":
      return "Transaksi sedang dalam dispute dan menunggu keputusan admin.";
    case "refunded":
      return "Dana sudah dikembalikan.";
    default:
      return "-";
  }
}

export default function UserRekberPage() {
  const { firebaseUser } = useAuth();

  const [items, setItems] = useState<RekberTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  async function loadRekber() {
    if (!firebaseUser) {
      setItems([]);
      setLoading(false);
      return;
    }

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
    const confirmed = confirm(
      "Konfirmasi transaksi selesai? Dana akan langsung dirilis ke seller."
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(id);

      await confirmRekberCompleted(id);
      await loadRekber();
    } catch (error) {
      console.error(error);
      alert("Gagal mengonfirmasi transaksi");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDispute(id: string) {
    const confirmed = confirm(
      "Buka dispute untuk transaksi ini? Admin akan memeriksa transaksi."
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(id);

      await disputeRekber(id);
      await loadRekber();
    } catch (error) {
      console.error(error);
      alert("Gagal membuka dispute");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">
          Transaksi Rekber Saya
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Pantau transaksi rekber akun game yang kamu beli di marketplace
          NextPay.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Memuat rekber...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada transaksi rekber.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const isActionLoading = actionLoadingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold text-slate-950">
                            {item.itemName}
                          </h2>

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadgeClass(
                              item.status
                            )}`}
                          >
                            {formatStatus(item.status)}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500">
                          Invoice: {item.invoice}
                        </p>

                        <p className="max-w-2xl whitespace-pre-line text-sm leading-6 text-slate-600">
                          {item.itemDescription || "-"}
                        </p>

                        <p className="text-sm text-slate-500">
                          {getBuyerStatusText(item.status)}
                        </p>
                      </div>

                      <div className="min-w-[220px] space-y-3 rounded-2xl bg-slate-50 p-4">
                        <div>
                          <p className="text-xs text-slate-500">Total Bayar</p>
                          <p className="mt-1 font-bold text-slate-950">
                            {formatRupiah(item.totalAmount)}
                          </p>
                        </div>

                        <div className="space-y-2">
                          {item.status === "waiting_payment" && (
                            <Button className="w-full">
                              <Link href={`/mock-rekber-payment/${item.id}`}>
                                Lanjut Bayar
                              </Link>
                            </Button>
                          )}

                          {item.status === "waiting_confirmation" && (
                            <>
                              <Button
                                className="w-full"
                                onClick={() => handleConfirm(item.id)}
                                disabled={isActionLoading}
                              >
                                {isActionLoading
                                  ? "Memproses..."
                                  : "Konfirmasi Selesai"}
                              </Button>

                              <Button
                                className="w-full"
                                onClick={() => handleDispute(item.id)}
                                disabled={isActionLoading}
                              >
                                Buka Dispute
                              </Button>
                            </>
                          )}

                          {item.status === "holding_fund" && (
                            <Button
                              className="w-full"
                              onClick={() => handleDispute(item.id)}
                              disabled={isActionLoading}
                            >
                              Buka Dispute
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}