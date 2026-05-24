"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { getWalletTransactionsByUserId } from "@/services/wallet-service";
import { formatRupiah } from "@/lib/format";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type WalletTransaction = {
  id: string;
  type: string;
  amount: number;
  description: string;
};

export default function SellerWithdrawPage() {
  const { appUser } = useAuth();

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  useEffect(() => {
    async function loadTransactions() {
      if (!appUser) return;

      const data = await getWalletTransactionsByUserId(appUser.uid);
      setTransactions(data as WalletTransaction[]);
    }

    loadTransactions();
  }, [appUser]);

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Saldo Seller</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-3xl font-bold text-slate-950">
            {formatRupiah(appUser?.balance || 0)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Saldo tersedia dari hasil release transaksi rekber.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mutasi Wallet</CardTitle>
        </CardHeader>

        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada mutasi wallet.
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((trx) => (
                <div
                  key={trx.id}
                  className="flex justify-between rounded-xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-medium text-slate-950">
                      {trx.description}
                    </p>
                    <p className="text-sm text-slate-500">{trx.type}</p>
                  </div>

                  <p className="font-bold text-green-600">
                    +{formatRupiah(trx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}