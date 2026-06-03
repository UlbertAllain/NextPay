"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  getAllUsers,
  updateUserRole,
  updateUserSuspension,
  UserProfile,
  UserRole,
} from "@/services/user-service";
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data user");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const stats = useMemo(() => {
    return {
      totalUser: users.filter((user) => user.role === "user").length,
      totalSeller: users.filter((user) => user.role === "seller").length,
      totalAdmin: users.filter((user) => user.role === "admin").length,
      totalSuperAdmin: users.filter((user) => user.role === "super_admin")
        .length,
      totalSuspended: users.filter((user) => isUserSuspended(user)).length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.name?.toLowerCase().includes(keyword) ||
        user.displayName?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.id.toLowerCase().includes(keyword)
      );
    });
  }, [users, search]);

  async function handleChangeRole(user: UserProfile, nextRole: UserRole) {
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
      setActionLoadingId(user.id);
      await updateUserRole(user.id, nextRole);
      await loadUsers();
    } catch (error) {
      console.error(error);
      alert("Gagal mengubah role user");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleToggleSuspension(user: UserProfile) {
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
      setActionLoadingId(user.id);
      await updateUserSuspension(user.id, nextSuspended);
      await loadUsers();
    } catch (error) {
      console.error(error);
      alert("Gagal mengubah status suspend user");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Manajemen User</h1>
        <p className="mt-2 text-sm text-slate-500">
          Kelola akun, role, saldo, status suspend, dan profil user NextPay.
        </p>
      </div>

<div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <StatCard title="User" value={stats.totalUser} description="Total akun user biasa" />
<StatCard title="Penjual" value={stats.totalSeller} description="Total akun penjual" />
<StatCard title="Admin" value={stats.totalAdmin} description="Total akun admin" />
<StatCard title="Super Admin" value={stats.totalSuperAdmin} description="Total akun super admin" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar User</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <input
            type="text"
            value={search}
            placeholder="Cari nama, email, atau UID user..."
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
          />

          {loading ? (
            <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-500">
              Memuat user...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-500">
              User tidak ditemukan.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Saldo</th>
                    <th className="px-4 py-3 text-left">Ubah Role</th>
                    <th className="px-4 py-3 text-left">Moderasi</th>
                    <th className="px-4 py-3 text-left">Detail</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => {
                    const displayName =
                      user.displayName || user.name || user.email || user.id;
                    const isSuperAdmin = user.role === "super_admin";
                    const isActionLoading = actionLoadingId === user.id;
                    const suspended = isUserSuspended(user);

                    return (
                      <tr key={user.id} className="bg-white">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={displayName}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                                {displayName.charAt(0).toUpperCase()}
                              </div>
                            )}

                            <div>
                              <div className="font-medium text-slate-900">
                                {displayName}
                              </div>
                              <div className="text-xs text-slate-500">
                                {user.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {user.email || "-"}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeClass(
                              user.role
                            )}`}
                          >
                            {user.role || "user"}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                              user
                            )}`}
                          >
                            {suspended ? "suspended" : user.status || "active"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {formatRupiah(user.balance ?? 0)}
                        </td>

                        <td className="px-4 py-3">
                          {isSuperAdmin ? (
                            <span className="text-xs text-slate-500">
                              Role terkunci
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <select
                                value={user.role || "user"}
                                disabled={isActionLoading}
                                onChange={(event) =>
                                  handleChangeRole(
                                    user,
                                    event.target.value as UserRole
                                  )
                                }
                                className="h-9 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-blue-500"
                              >
                                {editableRoles.map((role) => (
                                  <option key={role} value={role}>
                                    {role}
                                  </option>
                                ))}
                              </select>

                              {isActionLoading && (
                                <span className="text-xs text-slate-500">
                                  Menyimpan...
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <Button
                            type="button"
                            disabled={isSuperAdmin || isActionLoading}
                            onClick={() => handleToggleSuspension(user)}
                            className={
                              suspended
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-orange-600 hover:bg-orange-700"
                            }
                          >
                            {suspended ? "Aktifkan" : "Suspend"}
                          </Button>
                        </td>

                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            Detail
                          </Link>
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