"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import {
  getRekberBySellerId,
  markRekberDelivered,
} from "@/services/rekber-service";
import { RekberTransaction } from "@/types/rekber";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

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

function getSellerActionText(status: string) {
  switch (status) {
    case "waiting_payment":
      return "Menunggu pembayaran buyer";
    case "waiting_confirmation":
      return "Menunggu konfirmasi buyer";
    case "completed":
      return "Rekber selesai";
    case "dispute":
      return "Menunggu keputusan admin";
    case "refunded":
      return "Dana direfund ke buyer";
    default:
      return "-";
  }
}

export default function SellerOrdersPage() {
  const { firebaseUser } = useAuth();

  const [items, setItems] = useState<RekberTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  async function loadData() {
    if (!firebaseUser) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getRekberBySellerId(firebaseUser.uid);

      const sellerOnlyData = data.filter(
        (item) => item.sellerId === firebaseUser.uid
      );

      setItems(sellerOnlyData);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data order seller");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [firebaseUser]);

  async function handleMarkDelivered(rekberId: string) {
    const confirmed = confirm("Tandai item sudah dikirim ke buyer?");

    if (!confirmed) return;

    try {
      setActionLoadingId(rekberId);

      await markRekberDelivered(rekberId);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Gagal update status delivery");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">
          Order Rekber Seller
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Kelola transaksi rekber marketplace yang masuk ke akun seller kamu.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Order Rekber</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Memuat transaksi...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada transaksi rekber untuk seller ini.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-3 pr-4 font-medium">Invoice</th>
                    <th className="py-3 pr-4 font-medium">Item</th>
                    <th className="py-3 pr-4 font-medium">Buyer</th>
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
                          <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                            {item.itemDescription || "-"}
                          </p>
                        </td>

                        <td className="py-4 pr-4">
                          <p className="text-slate-700">{item.buyerId}</p>
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
                          {item.status === "holding_fund" ? (
                            <Button
                              onClick={() => handleMarkDelivered(item.id)}
                              disabled={isActionLoading}
                            >
                              {isActionLoading
                                ? "Memproses..."
                                : "Tandai Sudah Dikirim"}
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-500">
                              {getSellerActionText(item.status)}
                            </span>
                          )}
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