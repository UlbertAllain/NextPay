"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { useAuth } from "@/components/providers/auth-provider";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type WalletTransaction = {
  id: string;
  userId: string;
  amount: number;
  description: string;
  referenceId?: string;
  createdAt?: unknown;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function WalletPage() {
  const { firebaseUser } = useAuth();

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    if (!firebaseUser) return;

    try {
      setLoading(true);

      const userSnapshot = await getDoc(doc(db, "users", firebaseUser.uid));

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setBalance(userData.balance ?? 0);
      }

      const q = query(
        collection(db, "wallet_transactions"),
        where("userId", "==", firebaseUser.uid),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })) as WalletTransaction[];

      setTransactions(data);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data wallet");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [firebaseUser]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Wallet</h1>
        <p className="mt-2 text-sm text-slate-500">
          Pantau saldo dan riwayat transaksi wallet akun kamu.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-slate-500">Saldo Saat Ini</p>
          <p className="mt-2 text-4xl font-bold text-slate-950">
            {formatRupiah(balance)}
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Saldo bertambah ketika transaksi rekber selesai dan dana dilepas.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Wallet</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Memuat wallet...</p>
          ) : transactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <h2 className="font-semibold text-slate-950">
                Belum ada transaksi wallet
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Riwayat wallet akan muncul setelah transaksi rekber selesai.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center"
                >
                  <div>
                    <p className="font-medium text-slate-950">
                      {transaction.description}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Ref: {transaction.referenceId || "-"}
                    </p>
                  </div>

                  <p className="text-lg font-bold text-green-600">
                    +{formatRupiah(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}