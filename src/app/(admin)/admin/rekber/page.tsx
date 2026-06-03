"use client";

import { useEffect, useState } from "react";

import {
  disputeRekber,
  getAllRekberTransactions,
  refundRekberToBuyer,
  releaseDisputedRekberToSeller,
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
    case "cancelled":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function AdminRekberPage() {
  const [items, setItems] = useState<RekberTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  async function loadRekber() {
    try {
      setLoading(true);

      const data = await getAllRekberTransactions();
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
  }, []);

  async function handleDispute(id: string) {
    const confirmed = confirm("Masukkan transaksi ini ke status dispute?");

    if (!confirmed) return;

    try {
      setActionLoadingId(id);

      await disputeRekber(id);
      await loadRekber();
    } catch (error) {
      console.error(error);
      alert("Gagal mengubah transaksi menjadi dispute");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReleaseToSeller(id: string) {
    const confirmed = confirm(
      "Release dana dispute ini ke seller? Dana akan masuk ke wallet seller."
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(id);

      await releaseDisputedRekberToSeller(id);
      await loadRekber();
    } catch (error) {
      console.error(error);
      alert("Gagal release dana ke seller");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleRefundToBuyer(id: string) {
    const confirmed = confirm(
      "Refund dana dispute ini ke buyer? Dana akan dikembalikan ke wallet buyer."
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(id);

      await refundRekberToBuyer(id);
      await loadRekber();
    } catch (error) {
      console.error(error);
      alert("Gagal refund dana ke buyer");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Admin Rekber</h1>
        <p className="mt-2 text-sm text-slate-500">
          Pantau transaksi rekber. Admin hanya menangani dispute, refund,
          release manual, dan fraud handling.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semua Transaksi Rekber</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Memuat rekber...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada transaksi rekber.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-3 pr-4 font-medium">Invoice</th>
                    <th className="py-3 pr-4 font-medium">Item</th>
                    <th className="py-3 pr-4 font-medium">Buyer</th>
                    <th className="py-3 pr-4 font-medium">Seller</th>
                    <th className="py-3 pr-4 font-medium">Source</th>
                    <th className="py-3 pr-4 font-medium">Amount</th>
                    <th className="py-3 pr-4 font-medium">Fee</th>
                    <th className="py-3 pr-4 font-medium">Total</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => {
                    const isActionLoading = actionLoadingId === item.id;

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 align-top"
                      >
                        <td className="py-4 pr-4">
                          <p className="font-medium text-slate-950">
                            {item.invoice}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.id}
                          </p>
                        </td>

                        <td className="py-4 pr-4">
                          <p className="font-medium text-slate-950">
                            {item.itemName}
                          </p>
                          <p className="mt-1 max-w-xs whitespace-pre-line text-xs leading-5 text-slate-500">
                            {item.itemDescription || "-"}
                          </p>
                        </td>

                        <td className="py-4 pr-4">
                          <p className="max-w-[180px] break-all text-xs text-slate-600">
                            {item.buyerId}
                          </p>
                        </td>

                        <td className="py-4 pr-4">
                          {item.sellerId ? (
                            <p className="max-w-[180px] break-all text-xs text-slate-600">
                              {item.sellerId}
                            </p>
                          ) : (
                            <p className="text-xs text-slate-400">
                              Tidak ada seller
                            </p>
                          )}

                          <p className="mt-1 max-w-[180px] break-all text-xs text-slate-400">
                            {item.sellerContact}
                          </p>
                        </td>

                        <td className="py-4 pr-4">
                          <p className="text-xs text-slate-600">
                            {item.sourceType || "manual"}
                          </p>
                          {item.sourceId && (
                            <p className="mt-1 max-w-[160px] break-all text-xs text-slate-400">
                              {item.sourceId}
                            </p>
                          )}
                        </td>

                        <td className="py-4 pr-4">
                          {formatRupiah(item.amount)}
                        </td>

                        <td className="py-4 pr-4">
                          {formatRupiah(item.fee)}
                        </td>

                        <td className="py-4 pr-4 font-semibold text-slate-950">
                          {formatRupiah(item.totalAmount)}
                        </td>

                        <td className="py-4 pr-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadgeClass(
                              item.status
                            )}`}
                          >
                            {formatStatus(item.status)}
                          </span>
                        </td>

                        <td className="py-4 pr-4">
                          <div className="flex min-w-[170px] flex-col gap-2">
                            {(item.status === "holding_fund" ||
                              item.status === "waiting_confirmation") && (
                              <Button
                                variant="danger"
                                onClick={() => handleDispute(item.id)}
                                disabled={isActionLoading}
                              >
                                {isActionLoading
                                  ? "Memproses..."
                                  : "Masukkan Dispute"}
                              </Button>
                            )}

                            {item.status === "dispute" && (
                              <>
                                <Button
                                  onClick={() => handleReleaseToSeller(item.id)}
                                  disabled={isActionLoading}
                                >
                                  {isActionLoading
                                    ? "Memproses..."
                                    : "Release ke Seller"}
                                </Button>

                                <Button
                                  variant="danger"
                                  onClick={() => handleRefundToBuyer(item.id)}
                                  disabled={isActionLoading}
                                >
                                  {isActionLoading
                                    ? "Memproses..."
                                    : "Refund ke Buyer"}
                                </Button>
                              </>
                            )}

                            {item.status !== "holding_fund" &&
                              item.status !== "waiting_confirmation" &&
                              item.status !== "dispute" && (
                                <span className="text-xs text-slate-500">
                                  Tidak ada action
                                </span>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}