"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import {
  deleteAccountListing,
  getSellerAccountListings,
} from "@/services/account-listing-service";
import { AccountListing } from "@/types/account-listing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatGameName(game: string) {
  return game
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function SellerAccountsPage() {
  const { firebaseUser } = useAuth();

  const [items, setItems] = useState<AccountListing[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    if (!firebaseUser) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getSellerAccountListings(firebaseUser.uid);
      setItems(data);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data akun seller");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [firebaseUser]);

  async function handleDelete(id: string) {
    const confirmed = confirm(
      "Hapus produk akun ini? produk akun akan hilang dari marketplace."
    );

    if (!confirmed) return;

    try {
      await deleteAccountListing(id);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus data akun");
    }
  }

  

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Daftar Akun Game
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Kelola akun game yang kamu jual di marketplace NextPay.
          </p>
        </div>

        <Button>
          <Link href="/seller/accounts/create">Jual Akun Game</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Akun Game</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Memuat akun...</p>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6">
              <h2 className="font-semibold text-slate-950">
                Belum ada akun game
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Tambahkan akun game pertama untuk mulai berjualan.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-3 pr-4 font-medium">Akun Game</th>
                    <th className="py-3 pr-4 font-medium">Rank</th>
                    <th className="py-3 pr-4 font-medium">Harga</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Verified</th>
                    <th className="py-3 pr-4 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => {
                    const imageUrl = item.images?.[0];
                    const isLocked = item.status === "reserved" || item.status === "sold";
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 align-top"
                      >
                        <td className="py-4 pr-4">
                          <div className="flex gap-3">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={item.title}
                                className="h-16 w-20 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-16 w-20 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
                                No Image
                              </div>
                            )}

                            <div>
                              <p className="font-medium text-slate-950">
                                {item.title}
                              </p>
                              <p className="mt-1 line-clamp-2 max-w-md text-xs text-slate-500">
                                {item.description}
                              </p>
                              <p className="mt-1 text-xs text-blue-600">
                                {formatGameName(item.game)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 pr-4">{item.rank || "-"}</td>

                        <td className="py-4 pr-4 font-semibold text-slate-950">
                          {formatRupiah(item.price)}
                        </td>

                        <td className="py-4 pr-4 capitalize">
                          {item.status.replaceAll("_", " ")}
                        </td>

                        <td className="py-4 pr-4">
                          {item.verified ? "Verified" : "Unverified"}
                        </td>

                        <td className="py-4 pr-4">
                          <div className="flex flex-wrap gap-2">
                            <Button variant="secondary">
                              <Link href={`/akun-ml/${item.id}`}>Lihat</Link>
                            </Button>

                             {!isLocked ? (
                              <>
                                <Button variant="secondary">
                                  <Link href={`/seller/accounts/${item.id}/edit`}>
                                    Edit
                                  </Link>
                                </Button>

                                <Button
                                  variant="danger"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  Hapus
                                </Button>
                              </>
                            ) : (
                              <span className="text-xs text-slate-500">
                                Terkunci transaksi
                              </span>
                            )}
                          </div>
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