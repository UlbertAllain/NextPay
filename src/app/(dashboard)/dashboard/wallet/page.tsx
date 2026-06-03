"use client";

import { FormEvent, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWalletTransactionsByUserId } from "@/services/wallet-service";
import {
  createWithdrawalRequest,
  getWithdrawalsByUserId,
  WithdrawalRequest,
} from "@/services/withdrawal-service";

type WalletTransaction = {
  id: string;
  userId: string;
  type?: string;
  amount: number;
  description: string;
  referenceId?: string | null;
  createdAt?: unknown;
};

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

function getWithdrawalStatusClass(status: string) {
  switch (status) {
    case "pending":
      return "bg-orange-50 text-orange-700";
    case "approved":
      return "bg-green-50 text-green-700";
    case "rejected":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function WalletPage() {
  const { firebaseUser } = useAuth();

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");

  async function loadData() {
    if (!firebaseUser) {
      setBalance(0);
      setTransactions([]);
      setWithdrawals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const userSnapshot = await getDoc(doc(db, "users", firebaseUser.uid));

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setBalance(userData.balance ?? 0);
      }

      const walletData = await getWalletTransactionsByUserId(firebaseUser.uid);
      const withdrawalData = await getWithdrawalsByUserId(firebaseUser.uid);

      setTransactions(walletData as WalletTransaction[]);
      setWithdrawals(withdrawalData);
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

  async function handleSubmitWithdrawal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!firebaseUser) {
      alert("Silakan login terlebih dahulu");
      return;
    }

    const parsedAmount = Number(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      alert("Nominal pencairan tidak valid");
      return;
    }

    if (parsedAmount > balance) {
      alert("Saldo tidak mencukupi");
      return;
    }

    if (!bankName || !accountNumber || !accountHolderName) {
      alert("Lengkapi data rekening pencairan");
      return;
    }

    const confirmed = confirm(
  "Ajukan pencairan saldo? Dalam mode mock, pencairan akan otomatis disetujui dan saldo langsung berkurang."
);

    if (!confirmed) return;

    try {
      setSubmitLoading(true);

      await createWithdrawalRequest({
        userId: firebaseUser.uid,
        amount: parsedAmount,
        bankName,
        accountNumber,
        accountHolderName,
      });

      setAmount("");
      setBankName("");
      setAccountNumber("");
      setAccountHolderName("");

      await loadData();
   } catch (error) {
  const message =
    error instanceof Error
      ? error.message
      : "Gagal mengajukan withdrawal";

  alert(message);
}finally {
      setSubmitLoading(false);
    }
  } 

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Wallet</h1>
        <p className="mt-2 text-sm text-slate-500">
          Pantau saldo, riwayat transaksi, dan ajukan pencairan saldo seller.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saldo Saat Ini</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-bold text-slate-950">
                {formatRupiah(balance)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Saldo bertambah ketika transaksi rekber selesai dan dana
                dilepas ke seller.
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
                <div className="rounded-2xl border border-dashed border-slate-200 p-6">
                  <h2 className="font-semibold text-slate-950">
                    Belum ada transaksi wallet
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Riwayat wallet akan muncul setelah transaksi rekber selesai
                    atau withdrawal diajukan.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-slate-950">
                          {transaction.description}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Ref: {transaction.referenceId || "-"}
                        </p>
                        {transaction.type && (
                          <p className="mt-1 text-xs text-slate-400">
                            Type: {transaction.type}
                          </p>
                        )}
                      </div>

                      <p
                        className={`font-bold ${
                          transaction.amount >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.amount >= 0 ? "+" : "-"}
                        {formatRupiah(Math.abs(transaction.amount))}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ajukan Withdrawal</CardTitle>
            </CardHeader>

            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmitWithdrawal}>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Nominal
                  </label>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="Contoh: 50000"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Nama Bank / E-Wallet
                  </label>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={bankName}
                    onChange={(event) => setBankName(event.target.value)}
                    placeholder="Contoh: BCA / DANA"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Nomor Rekening / E-Wallet
                  </label>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={accountNumber}
                    onChange={(event) => setAccountNumber(event.target.value)}
                    placeholder="Contoh: 1234567890"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Nama Pemilik Rekening
                  </label>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={accountHolderName}
                    onChange={(event) =>
                      setAccountHolderName(event.target.value)
                    }
                    placeholder="Sesuai rekening"
                  />
                </div>

                <Button
                  className="w-full"
                  type="submit"
                  disabled={submitLoading || balance <= 0}
                >
                  {submitLoading ? "Memproses..." : "Ajukan Withdrawal"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Riwayat Withdrawal</CardTitle>
            </CardHeader>

            <CardContent>
              {loading ? (
                <p className="text-sm text-slate-500">
                  Memuat withdrawal...
                </p>
              ) : withdrawals.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Belum ada pengajuan withdrawal.
                </p>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map((withdrawal) => (
                    <div
                      key={withdrawal.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">
                            {formatRupiah(withdrawal.amount)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {withdrawal.bankName} •{" "}
                            {withdrawal.accountNumber}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {withdrawal.accountHolderName}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getWithdrawalStatusClass(
                            withdrawal.status
                          )}`}
                        >
                          {formatStatus(withdrawal.status)}
                        </span>
                      </div>

                      {withdrawal.note && (
                        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                          Catatan: {withdrawal.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}