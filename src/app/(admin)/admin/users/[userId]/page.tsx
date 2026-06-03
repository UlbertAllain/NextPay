"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { getSellerAccountListings } from "@/services/account-listing-service";
import { getRekberByBuyerId, getRekberBySellerId } from "@/services/rekber-service";
import {
  getPublicUserProfile,
  updateUserRole,
  updateUserSuspension,
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

function isUserSuspended(user: UserProfile) {
  return user.isSuspended === true || user.status === "suspended";
}

function getStatusBadgeClass(user: UserProfile) {
  if (isUserSuspended(user)) {
    return "bg-orange-50 text-orange-700";
  }

  if (user.status === "banned") {
    return "bg-red-50 text-red-700";
  }

  return "bg-green-50 text-green-700";
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
  const [suspensionLoading, setSuspensionLoading] = useState(false);

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

  async function handleToggleSuspension() {
    if (!user) return;

    if (user.role === "super_admin") {
      alert("Super admin tidak boleh disuspend dari panel ini");
      return;
    }

    const nextSuspended = !isUserSuspended(user);

    const confirmed = confirm(
      nextSuspended
        ? `Suspend user ${user.email || user.id}?`
        : `Aktifkan kembali user ${user.email || user.id}?`
    );

    if (!confirmed) return;

    try {
      setSuspensionLoading(true);
      await updateUserSuspension(user.id, nextSuspended);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Gagal mengubah status suspend user");
    } finally {
      setSuspensionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Memuat detail user...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">
          User tidak ditemukan
        </h1>

        <Link
          href="/admin/users"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Kembali ke daftar user
        </Link>
      </div>
    );
  }

  const displayName = user.displayName || user.name || user.email || user.id;
  const isSuperAdmin = user.role === "super_admin";
  const suspended = isUserSuspended(user);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        ← Kembali ke daftar user
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Detail User</h1>
        <p className="mt-2 text-sm text-slate-500">
          Pantau profil, role, saldo, status suspend, akun dijual, dan aktivitas
          transaksi user.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
       <StatCard title="Total Akun" value={analytics.totalAccounts} description="Semua akun yang dibuat user" />
<StatCard title="Akun Aktif" value={analytics.activeAccounts} description="Akun yang sedang tampil public" />
<StatCard title="Akun Terjual" value={analytics.soldAccounts} description="Akun yang sudah terjual" />
<StatCard title="Review" value={reviewCount} description="Total review penjual" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
       <StatCard title="Rekber Buyer" value={analytics.buyerRekberCount} description="Total transaksi sebagai buyer" />
<StatCard title="Rekber Seller" value={analytics.sellerRekberCount} description="Total transaksi sebagai seller" />
<StatCard title="Revenue Seller" value={formatRupiah(analytics.totalSellerRevenue)} description="Total pendapatan dari rekber selesai" />
<StatCard title="Withdrawal Approved" value={formatRupiah(analytics.totalWithdrawal)} description="Total withdrawal disetujui admin" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil User</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-4">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-700">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {displayName}
                </h2>
                <p className="text-sm text-slate-500">{user.email || "-"}</p>
                <p className="mt-1 text-xs text-slate-400">UID: {user.id}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeClass(
                      user.role
                    )}`}
                  >
                    {user.role || "user"}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                      user
                    )}`}
                  >
                    {suspended ? "suspended" : user.status || "active"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 text-right">
              <p className="text-xs text-slate-500">Saldo</p>
              <p className="text-xl font-bold text-slate-900">
                {formatRupiah(user.balance ?? 0)}
              </p>
            </div>
          </div>

          {user.bio && (
            <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
              {user.bio}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900">Ubah Role</h3>

              <div className="mt-3">
                {isSuperAdmin ? (
                  <p className="text-sm text-slate-500">
                    Role super admin terkunci.
                  </p>
                ) : (
                  <div className="flex items-center gap-3">
                    <select
                      value={user.role || "user"}
                      disabled={roleLoading}
                      onChange={(event) =>
                        handleChangeRole(event.target.value as UserRole)
                      }
                      className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                    >
                      {editableRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>

                    {roleLoading && (
                      <span className="text-xs text-slate-500">
                        Menyimpan...
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900">Moderasi User</h3>
              <p className="mt-1 text-sm text-slate-500">
                User yang disuspend tetap bisa login, tetapi tidak bisa jual
                akun, beli akun, membuat rekber, atau withdraw.
              </p>

              <div className="mt-4">
                <Button
                  type="button"
                  disabled={isSuperAdmin || suspensionLoading}
                  onClick={handleToggleSuspension}
                  className={
                    suspended
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-orange-600 hover:bg-orange-700"
                  }
                >
                  {suspensionLoading
                    ? "Memproses..."
                    : suspended
                    ? "Aktifkan User"
                    : "Suspend User"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {account.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      Status: {account.status.replaceAll("_", " ")}
                    </p>
                  </div>

                  <p className="font-semibold text-slate-900">
                    {formatRupiah(account.price)}
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