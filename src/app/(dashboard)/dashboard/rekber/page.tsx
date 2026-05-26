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
    await confirmRekberCompleted(id);
    await loadRekber();
  }

  async function handleDispute(id: string) {
    await disputeRekber(id);
    await loadRekber();
  }

  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Rekber Saya</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Memuat rekber...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada transaksi rekber.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <p className="font-semibold text-slate-950">
                        {item.itemName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {item.invoice}
                      </p>
                      <p className="mt-1 text-sm capitalize text-blue-600">
                        {item.status.replaceAll("_", " ")}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="font-bold text-slate-950">
                        {formatRupiah(item.totalAmount)}
                      </p>

                           {item.status === "holding_fund" ? (
                            <p className="text-sm text-slate-500">
                              Dana sudah ditahan. Menunggu seller menyerahkan item.
                            </p>
                          ) : null}

                          {item.status === "waiting_confirmation" ? (
                            <div className="flex gap-2">
                              <Button
                                variant="secondary"
                                onClick={() => handleDispute(item.id)}
                              >
                                Dispute
                              </Button>

                              <Button onClick={() => handleConfirm(item.id)}>
                                Konfirmasi Selesai
                              </Button>
                            </div>
                          ) : null}

                          {item.status === "dispute" ? (
                            <p className="text-sm text-orange-600">
                              Transaksi sedang dalam dispute dan menunggu keputusan admin.
                            </p>
                          ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}