"use client";

import { useEffect, useMemo, useState } from "react";

import {
  assignSellerToRekber,
  confirmRekberCompleted,
  disputeRekber,
  getAllRekberTransactions,
} from "@/services/rekber-service";

import { getSellers, UserWithId } from "@/services/user-service";

import { RekberTransaction } from "@/types/rekber";

import { formatRupiah } from "@/lib/format";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminRekberPage() {
  const [items, setItems] = useState<RekberTransaction[]>([]);
  const [sellers, setSellers] = useState<UserWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [selectedSellerIds, setSelectedSellerIds] = useState<
    Record<string, string>
  >({});

  async function loadData() {
    try {
      setLoading(true);

      const [rekberData, sellerData] = await Promise.all([
        getAllRekberTransactions(),
        getSellers(),
      ]);

      setItems(rekberData);
      setSellers(sellerData);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data rekber");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const sellerMap = useMemo(() => {
    return sellers.reduce<Record<string, UserWithId>>((acc, seller) => {
      acc[seller.uid] = seller;
      acc[seller.id] = seller;
      return acc;
    }, {});
  }, [sellers]);

  async function handleAssignSeller(rekberId: string) {
    const sellerId = selectedSellerIds[rekberId];

    if (!sellerId) {
      alert("Pilih seller dulu");
      return;
    }

    try {
      setActionLoadingId(rekberId);

      await assignSellerToRekber(rekberId, sellerId);

      await loadData();
    } catch (error) {
      console.error(error);
      alert("Gagal assign seller");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleRelease(id: string) {
    const confirmed = confirm(
      "Release dana ke seller? Aksi ini akan menambah saldo seller."
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(id);

      await confirmRekberCompleted(id);

      await loadData();
    } catch (error) {
      console.error(error);
      alert("Gagal release rekber");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDispute(id: string) {
    const confirmed = confirm("Tandai transaksi ini sebagai dispute?");

    if (!confirmed) return;

    try {
      setActionLoadingId(id);

      await disputeRekber(id);

      await loadData();
    } catch (error) {
      console.error(error);
      alert("Gagal dispute rekber");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
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
                  <th className="py-3 pr-4 font-medium">Seller Contact</th>
                  <th className="py-3 pr-4 font-medium">Assign Seller</th>
                  <th className="py-3 pr-4 font-medium">Amount</th>
                  <th className="py-3 pr-4 font-medium">Fee</th>
                  <th className="py-3 pr-4 font-medium">Total</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => {
                  const assignedSeller = item.sellerId
                    ? sellerMap[item.sellerId]
                    : null;

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
                        <p className="text-slate-700">
                          {item.sellerContact || "-"}
                        </p>
                      </td>

                      <td className="py-4 pr-4">
                        {item.sellerId ? (
                          <div>
                            <p className="font-medium text-slate-950">
                              {assignedSeller?.name || "Seller assigned"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {assignedSeller?.email || item.sellerId}
                            </p>
                          </div>
                        ) : (
                          <div className="flex min-w-64 gap-2">
                            <select
                              value={selectedSellerIds[item.id] || ""}
                              onChange={(event) =>
                                setSelectedSellerIds((prev) => ({
                                  ...prev,
                                  [item.id]: event.target.value,
                                }))
                              }
                              className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500"
                            >
                              <option value="">Pilih seller</option>

                              {sellers.map((seller) => (
                                <option key={seller.uid} value={seller.uid}>
                                  {seller.name} — {seller.email}
                                </option>
                              ))}
                            </select>

                            <Button
                              onClick={() => handleAssignSeller(item.id)}
                              disabled={
                                isActionLoading ||
                                !selectedSellerIds[item.id]
                              }
                            >
                              Assign
                            </Button>
                          </div>
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
                        <StatusBadge value={item.status} />
                      </td>

                      <td className="py-4 pr-4">
                        {item.status === "holding_fund" ||
                        item.status === "dispute" ? (
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              onClick={() => handleDispute(item.id)}
                              disabled={isActionLoading}
                            >
                              Dispute
                            </Button>

                            <Button
                              onClick={() => handleRelease(item.id)}
                              disabled={isActionLoading || !item.sellerId}
                            >
                              Release
                            </Button>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
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
  );
}

function StatusBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-700">
      {value.replaceAll("_", " ")}
    </span>
  );
}