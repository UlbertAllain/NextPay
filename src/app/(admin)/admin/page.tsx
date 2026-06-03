"use client";

import { useEffect, useMemo, useState } from "react";

import { getAllAccountListings } from "@/services/account-listing-service";
import { getAllRekberTransactions } from "@/services/rekber-service";
import { getAllUsers, UserProfile } from "@/services/user-service";
import {
  getAllWithdrawals,
  WithdrawalRequest,
} from "@/services/withdrawal-service";
import { AccountListing } from "@/types/account-listing";
import { RekberTransaction } from "@/types/rekber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-slate-500">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-2xl font-bold text-slate-950">{value}</p>
        <p className="mt-2 text-xs text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [accounts, setAccounts] = useState<AccountListing[]>([]);
  const [rekbers, setRekbers] = useState<RekberTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAnalytics() {
    try {
      setLoading(true);

      const [userData, accountData, rekberData, withdrawalData] =
        await Promise.all([
          getAllUsers(),
          getAllAccountListings(),
          getAllRekberTransactions(),
          getAllWithdrawals(),
        ]);

      setUsers(userData);
      setAccounts(accountData);
      setRekbers(rekberData);
      setWithdrawals(withdrawalData);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data analytics admin");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const analytics = useMemo(() => {
    const totalUsers = users.length;
    const totalSellers = users.filter((user) => user.role === "seller").length;
    const totalAdmins = users.filter(
      (user) => user.role === "admin" || user.role === "super_admin"
    ).length;

    const totalAccounts = accounts.length;
    const publishedAccounts = accounts.filter(
      (account) => account.status === "published"
    ).length;
    const pendingAccounts = accounts.filter(
      (account) => account.status === "pending_review"
    ).length;
    const soldAccounts = accounts.filter(
      (account) => account.status === "sold"
    ).length;

    const totalRekber = rekbers.length;
    const completedRekber = rekbers.filter(
      (rekber) => rekber.status === "completed"
    ).length;
    const disputeRekber = rekbers.filter(
      (rekber) => rekber.status === "dispute"
    ).length;
    const refundedRekber = rekbers.filter(
      (rekber) => rekber.status === "refunded"
    ).length;

    const rekberRevenue = rekbers
      .filter((rekber) => rekber.status === "completed")
      .reduce((total, rekber) => total + (rekber.fee || 0), 0);

    const totalWithdrawalAmount = withdrawals
      .filter((withdrawal) => withdrawal.status === "approved")
      .reduce((total, withdrawal) => total + withdrawal.amount, 0);

    return {
      totalUsers,
      totalSellers,
      totalAdmins,
      totalAccounts,
      publishedAccounts,
      pendingAccounts,
      soldAccounts,
      totalRekber,
      completedRekber,
      disputeRekber,
      refundedRekber,
      rekberRevenue,
      totalWithdrawalAmount,
    };
  }, [users, accounts, rekbers, withdrawals]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">
          Dashboard Admin
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Ringkasan performa marketplace, rekber, dan pencairan saldo NextPay.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Memuat analytics...</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total User"
              value={analytics.totalUsers}
              description="Semua akun yang terdaftar di NextPay."
            />
            <StatCard
              title="Total Penjual"
              value={analytics.totalSellers}
              description="User dengan role penjual."
            />
            <StatCard
              title="Total Admin"
              value={analytics.totalAdmins}
              description="Admin dan super admin."
            />
            <StatCard
              title="Total Akun Dijual"
              value={analytics.totalAccounts}
              description="Seluruh akun game yang dibuat penjual."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Akun Aktif"
              value={analytics.publishedAccounts}
              description="Akun yang tampil di marketplace."
            />
            <StatCard
              title="Menunggu Persetujuan"
              value={analytics.pendingAccounts}
              description="Akun yang perlu direview admin."
            />
            <StatCard
              title="Akun Terjual"
              value={analytics.soldAccounts}
              description="Akun yang sudah selesai transaksi."
            />
            <StatCard
              title="Total Rekber"
              value={analytics.totalRekber}
              description="Semua transaksi rekber internal."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Rekber Selesai"
              value={analytics.completedRekber}
              description="Transaksi yang sudah selesai."
            />
            <StatCard
              title="Rekber Dispute"
              value={analytics.disputeRekber}
              description="Transaksi yang sedang bermasalah."
            />
            <StatCard
              title="Rekber Refund"
              value={analytics.refundedRekber}
              description="Transaksi yang dikembalikan ke pembeli."
            />
            <StatCard
              title="Revenue Fee Rekber"
              value={formatRupiah(analytics.rekberRevenue)}
              description="Estimasi pendapatan dari fee rekber selesai."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Pencairan"
              value={formatRupiah(analytics.totalWithdrawalAmount)}
              description="Total pencairan saldo yang sudah approved."
            />
          </div>
        </>
      )}
    </section>
  );
}