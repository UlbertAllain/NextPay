"use client";

import { useEffect, useState } from "react";

import {
  assignSellerToRekber,
  confirmRekberCompleted,
  disputeRekber,
  getAllRekberTransactions,
} from "@/services/rekber-service";

import { RekberTransaction } from "@/types/rekber";
import { formatRupiah } from "@/lib/format";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminRekberPage() {
  const [items, setItems] = useState<RekberTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellerIds, setSellerIds] = useState<Record<string, string>>({});

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

  async function handleAssignSeller(rekberId: string) {
    const sellerId = sellerIds[rekberId];

    if (!sellerId) {
      alert("Seller ID wajib diisi");
      return;
    }

    try {
      await assignSellerToRekber(rekberId, sellerId);
      await loadRekber();
    } catch (error) {
      console.error(error);
      alert("Gagal assign seller");
    }
  }

  async function handleRelease(id: string) {
    try {
      await confirmRekberCompleted(id);
      await loadRekber();
    } catch (error) {
      console.error(error);
      alert("Gagal release rekber");
    }
  }

  async function handleDispute(id: string) {
    try {
      await disputeRekber(id);
      await loadRekber();
    } catch (error) {
      console.error(error);
      alert("Gagal dispute rekber");
    }
  }

  return (
    <section>
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
              <table className="w-full min-w-[1200px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-3 pr-4 font-medium">Invoice</th>
                    <th className="py-3 pr-4 font-medium">Item</th>
                    <th className="py-3 pr-4 font-medium">Seller</th>
                    <th className="py-3 pr-4 font-medium">Seller ID</th>
                    <th className="py-3 pr-4 font-medium">Amount</th>
                    <th className="py-3 pr-4 font-medium">Fee</th>
                    <th className="py-3 pr-4 font-medium">Total</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-4 pr-4 font-medium text-slate-950">
                        {item.invoice}
                      </td>

                      <td className="py-4 pr-4">
                        <p className="font-medium text-slate-950">
                          {item.itemName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.itemDescription || "-"}
                        </p>
                      </td>

                      <td className="py-4 pr-4">{item.sellerContact}</td>

                      <td className="py-4 pr-4">
                        {item.sellerId ? (
                          <span className="text-xs text-slate-600">
                            {item.sellerId}
                          </span>
                        ) : (
                          <div className="flex min-w-64 gap-2">
                            <input
                              value={sellerIds[item.id] || ""}
                              onChange={(e) =>
                                setSellerIds((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.value,
                                }))
                              }
                              placeholder="UID seller"
                              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500"
                            />

                            <Button
                              variant="secondary"
                              onClick={() => handleAssignSeller(item.id)}
                            >
                              Assign
                            </Button>
                          </div>
                        )}
                      </td>

                      <td className="py-4 pr-4">
                        {formatRupiah(item.amount)}
                      </td>

                      <td className="py-4 pr-4">{formatRupiah(item.fee)}</td>

                      <td className="py-4 pr-4 font-semibold">
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
                            >
                              Dispute
                            </Button>

                            <Button onClick={() => handleRelease(item.id)}>
                              Release
                            </Button>
                          </div>
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