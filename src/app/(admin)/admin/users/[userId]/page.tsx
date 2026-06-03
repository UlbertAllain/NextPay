"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { getSellerAccountListings } from "@/services/account-listing-service";
import { getRekberByBuyerId, getRekberBySellerId } from "@/services/rekber-service";
import {
  getPublicUserProfile,
  updateUserRole,
  UserProfile,
  UserRole,
} from "@/services/user-service";
import { getReviewsBySellerId } from "@/services/seller-review-service";
import { getWithdrawalsByUserId, WithdrawalRequest } from "@/services/withdrawal-service";
import { AccountListing } from "@/types/account-listing";
import { RekberTransaction } from "@/types/rekber";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/admin/stat-card";

const editableRoles: UserRole[] = ["user", "seller", "admin"];

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getRoleBadgeClass(role?: string | null) {
  switch (role) {
    case "super_admin":
      return "bg-purple-50 text-purple-700";
    case "admin":
      return "bg-red-50 text-red-700";
    case "seller":
      return "bg-blue-50 text-blue-700";
    case "user":
      return "bg-green-50 text-green-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function AdminUserDetailPage() {
  const params = useParams<{ userId: string }>();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [sellerAccounts, setSellerAccounts] = useState<AccountListing[]>([]);
  const [buyerRekbers, setBuyerRekbers] = useState<RekberTransaction[]>([]);
  const [sellerRekbers, setSellerRekbers] = useState<RekberTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [reviewCount, setReviewCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);

  async function loadData() {
    try {
      setLoading(true);

      const [
        userData,
        sellerAccountData,
        buyerRekberData,
        sellerRekberData,
        withdrawalData,
        reviewData,
      ] = await Promise.all([
        getPublicUserProfile(params.userId),
        getSellerAccountListings(params.userId),
        getRekberByBuyerId(params.userId),
        getRekberBySellerId(params.userId),
        getWithdrawalsByUserId(params.userId),
        getReviewsBySellerId(params.userId),
      ]);

      setUser(userData);
      setSellerAccounts(sellerAccountData);
      setBuyerRekbers(buyerRekberData);
      setSellerRekbers(sellerRekberData);
      setWithdrawals(withdrawalData);
      setReviewCount(reviewData.length);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil detail user");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [params.userId]);

  const analytics = useMemo(() => {
    const completedSellerRekber = sellerRekbers.filter(
      (rekber) => rekber.status === "completed"
    );

    const totalSellerRevenue = completedSellerRekber.reduce(
      (total, rekber) => total + (rekber.amount || 0),
      0
    );

    const totalWithdrawal = withdrawals
      .filter((withdrawal) => withdrawal.status === "approved")
      .reduce((total, withdrawal) => total + withdrawal.amount, 0);

    return {
      totalAccounts: sellerAccounts.length,
      activeAccounts: sellerAccounts.filter(
        (account) => account.status === "published"
      ).length,
      soldAccounts: sellerAccounts.filter((account) => account.status === "sold")
        .length,
      buyerRekberCount: buyerRekbers.length,
      sellerRekberCount: sellerRekbers.length,
      totalSellerRevenue,
      totalWithdrawal,
    };
  }, [sellerAccounts, buyerRekbers, sellerRekbers, withdrawals]);

  async function handleChangeRole(nextRole: UserRole) {
    if (!user) return;

    if (user.role === "super_admin") {
      alert("Role super admin tidak boleh diubah dari panel ini");
      return;
    }

    if (user.role === nextRole) return;

    const confirmed = confirm(
      `Ubah role ${user.email || user.id} menjadi ${nextRole}?`
    );

    if (!confirmed) return;

    try {
      setRoleLoading(true);

      await updateUserRole(user.id, nextRole);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Gagal mengubah role user");
    } finally {
      setRoleLoading(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Memuat detail user...</p>;
  }

  if (!user) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-950">
          User tidak ditemukan
        </h1>
        <Link href="/admin/users" className="text-sm text-blue-600">
          Kembali ke daftar user
        </Link>
      </section>
    );
  }

  const displayName = user.displayName || user.name || user.email || user.id;
  const isSuperAdmin = user.role === "super_admin";

  return (
    <section className="space-y-6">
      <div>
        <Link href="/admin/users" className="text-sm text-blue-600">
          ← Kembali ke daftar user
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-slate-950">
          Detail User
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Pantau profil, role, saldo, akun dijual, dan aktivitas transaksi user.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil User</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-4">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="h-20 w-20 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-xl font-semibold text-slate-500">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  {displayName}
                </h2>

                <p className="mt-1 break-all text-sm text-slate-500">
                  {user.email || "-"}
                </p>

                <p className="mt-1 break-all text-xs text-slate-400">
                  UID: {user.id}
                </p>

                <span
                  className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getRoleBadgeClass(
                    user.role
                  )}`}
                >
                  {user.role || "user"}
                </span>

                {user.bio && (
                  <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-6 text-slate-600">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="min-w-[220px] rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Saldo</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">
                {formatRupiah(user.balance ?? 0)}
              </p>

              <div className="mt-4">
                <p className="text-sm font-medium text-slate-700">Ubah Role</p>

                {isSuperAdmin ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Role super admin terkunci.
                  </p>
                ) : (
                  <select
                    className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                    value={user.role || "user"}
                    disabled={roleLoading}
                    onChange={(event) =>
                      handleChangeRole(event.target.value as UserRole)
                    }
                  >
                    {editableRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Akun Dijual"
          value={analytics.totalAccounts}
          description="Total akun game yang pernah dibuat user."
        />

        <StatCard
          title="Akun Aktif"
          value={analytics.activeAccounts}
          description="Akun yang sedang tampil di marketplace."
        />

        <StatCard
          title="Akun Terjual"
          value={analytics.soldAccounts}
          description="Akun yang selesai terjual."
        />

        <StatCard
          title="Review Penjual"
          value={reviewCount}
          description="Jumlah review yang diterima sebagai penjual."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Transaksi Pembeli"
          value={analytics.buyerRekberCount}
          description="Jumlah rekber saat user menjadi pembeli."
        />

        <StatCard
          title="Transaksi Penjual"
          value={analytics.sellerRekberCount}
          description="Jumlah rekber saat user menjadi penjual."
        />

        <StatCard
          title="Pendapatan Penjual"
          value={formatRupiah(analytics.totalSellerRevenue)}
          description="Total dana rekber yang masuk sebagai penjual."
        />

        <StatCard
          title="Pencairan Saldo"
          value={formatRupiah(analytics.totalWithdrawal)}
          description="Total pencairan saldo yang sudah approved."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Akun Dijual Terbaru</CardTitle>
        </CardHeader>

        <CardContent>
          {sellerAccounts.length === 0 ? (
            <p className="text-sm text-slate-500">
              User ini belum memiliki akun yang dijual.
            </p>
          ) : (
            <div className="space-y-3">
              {sellerAccounts.slice(0, 5).map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-medium text-slate-950">
                      {account.title}
                    </p>
                    <p className="mt-1 text-xs capitalize text-slate-500">
                      Status: {account.status.replaceAll("_", " ")}
                    </p>
                  </div>

                  <p className="font-semibold text-slate-950">
                    {formatRupiah(account.price)}
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