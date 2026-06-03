"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  getAllUsers,
  updateUserRole,
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

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Manajemen User</h1>
        <p className="mt-2 text-sm text-slate-500">
          Kelola akun, role, saldo, dan profil user NextPay.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total User"
          value={stats.totalUser}
          description="User biasa yang terdaftar."
        />

        <StatCard
          title="Total Penjual"
          value={stats.totalSeller}
          description="User dengan role penjual."
        />

        <StatCard
          title="Total Admin"
          value={stats.totalAdmin}
          description="Administrator platform."
        />

        <StatCard
          title="Super Admin"
          value={stats.totalSuperAdmin}
          description="Role tertinggi sistem."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar User</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Cari nama, email, atau UID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Memuat user...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-sm text-slate-500">
              User tidak ditemukan.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-3 pr-4 font-medium">User</th>
                    <th className="py-3 pr-4 font-medium">Email</th>
                    <th className="py-3 pr-4 font-medium">Role</th>
                    <th className="py-3 pr-4 font-medium">Saldo</th>
                    <th className="py-3 pr-4 font-medium">Ubah Role</th>
                    <th className="py-3 pr-4 font-medium">Detail</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => {
                    const displayName =
                      user.displayName || user.name || user.email || user.id;

                    const isSuperAdmin = user.role === "super_admin";
                    const isActionLoading = actionLoadingId === user.id;

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-slate-100 align-top"
                      >
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={displayName}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
                                {displayName.charAt(0).toUpperCase()}
                              </div>
                            )}

                            <div>
                              <p className="font-medium text-slate-950">
                                {displayName}
                              </p>
                              <p className="mt-1 max-w-[220px] break-all text-xs text-slate-400">
                                {user.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 pr-4">
                          <p className="max-w-[240px] break-all text-slate-600">
                            {user.email || "-"}
                          </p>
                        </td>

                        <td className="py-4 pr-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getRoleBadgeClass(
                              user.role
                            )}`}
                          >
                            {user.role || "user"}
                          </span>
                        </td>

                        <td className="py-4 pr-4 font-semibold text-slate-950">
                          {formatRupiah(user.balance ?? 0)}
                        </td>

                        <td className="py-4 pr-4">
                          {isSuperAdmin ? (
                            <span className="text-xs text-slate-500">
                              Role terkunci
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <select
                                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                                value={user.role || "user"}
                                disabled={isActionLoading}
                                onChange={(event) =>
                                  handleChangeRole(
                                    user,
                                    event.target.value as UserRole
                                  )
                                }
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

                        <td className="py-4 pr-4">
                          <Button variant="secondary">
                            <Link href={`/admin/users/${user.id}`}>
                              Detail
                            </Link>
                          </Button>
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
    </section>
  );
}