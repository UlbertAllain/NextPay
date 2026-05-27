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

export default function SellerOrdersPage() {
  const { firebaseUser } = useAuth();

  const [items, setItems] = useState<RekberTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(
    null
  );

  async function loadData() {
    if (!firebaseUser) return;

    try {
      setLoading(true);

      const data = await getRekberBySellerId(firebaseUser.uid);

      setItems(data);
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
    const confirmed = confirm(
      "Tandai item sudah dikirim ke buyer?"
    );

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
          Kelola transaksi rekber yang ditugaskan ke akun seller kamu.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Rekber</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">
              Memuat transaksi...
            </p>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada transaksi rekber untuk seller ini.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-3 pr-4 font-medium">
                      Invoice
                    </th>

                    <th className="py-3 pr-4 font-medium">
                      Item
                    </th>

                    <th className="py-3 pr-4 font-medium">
                      Buyer
                    </th>

                    <th className="py-3 pr-4 font-medium">
                      Amount
                    </th>

                    <th className="py-3 pr-4 font-medium">
                      Fee
                    </th>

                    <th className="py-3 pr-4 font-medium">
                      Total
                    </th>

                    <th className="py-3 pr-4 font-medium">
                      Status
                    </th>

                    <th className="py-3 pr-4 font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => {
                    const isActionLoading =
                      actionLoadingId === item.id;

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
                          <p className="text-slate-700">
                            {item.buyerId}
                          </p>
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
                          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-700">
                            {formatStatus(item.status)}
                          </span>
                        </td>

                        <td className="py-4 pr-4">
                          {item.status === "holding_fund" ? (
                            <Button
                              onClick={() =>
                                handleMarkDelivered(item.id)
                              }
                              disabled={isActionLoading}
                            >
                              {isActionLoading
                                ? "Memproses..."
                                : "Tandai Sudah Dikirim"}
                            </Button>
                          ) : item.status ===
                            "waiting_confirmation" ? (
                            <span className="text-xs text-orange-600">
                              Menunggu konfirmasi buyer
                            </span>
                          ) : item.status === "completed" ? (
                            <span className="text-xs text-green-600">
                              Rekber selesai
                            </span>
                          ) : item.status === "dispute" ? (
                            <span className="text-xs text-red-600">
                              Sedang dispute
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">
                              -
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