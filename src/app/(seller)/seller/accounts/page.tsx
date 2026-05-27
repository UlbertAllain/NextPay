"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { getSellerAccountListings, deleteAccountListing } from "@/services/account-listing-service";
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
    if (!firebaseUser) return;

    try {
      setLoading(true);
      const data = await getSellerAccountListings(firebaseUser.uid);
      setItems(data);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil listing akun seller");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [firebaseUser]);

  async function handleDelete(id: string) {
  const confirmed = confirm(
    "Hapus listing ini? Listing akan hilang dari marketplace."
  );

  if (!confirmed) return;

  try {
    await deleteAccountListing(id);
    await loadData();
  } catch (error) {
    console.error(error);
    alert("Gagal menghapus listing");
  }
}

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Listing Akun Game
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Kelola akun game yang kamu jual di marketplace NextPay.
          </p>
        </div>

        <Link href="/seller/accounts/create">
          <Button>Tambah Listing</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Listing</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Memuat listing...</p>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <h2 className="font-semibold text-slate-950">
                Belum ada listing
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Tambahkan akun game pertama untuk mulai berjualan.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-3 pr-4 font-medium">Akun</th>
                    <th className="py-3 pr-4 font-medium">Game</th>
                    <th className="py-3 pr-4 font-medium">Rank</th>
                    <th className="py-3 pr-4 font-medium">Harga</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Verified</th>
                    <th className="py-3 pr-4 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 align-top"
                    >
                      <td className="py-4 pr-4">
                        <p className="font-medium text-slate-950">
                          {item.title}
                        </p>
                        <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                          {item.description}
                        </p>
                      </td>

                      <td className="py-4 pr-4">
                        {formatGameName(item.game)}
                      </td>

                      <td className="py-4 pr-4">{item.rank || "-"}</td>

                      <td className="py-4 pr-4 font-semibold text-slate-950">
                        {formatRupiah(item.price)}
                      </td>

                      <td className="py-4 pr-4">
                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-700">
                          {item.status.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td className="py-4 pr-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                            item.verified
                              ? "bg-green-50 text-green-700"
                              : "bg-slate-100 text-slate-500",
                          ].join(" ")}
                        >
                          {item.verified ? "Verified" : "Unverified"}
                        </span>
                      </td>

                      <td className="py-4 pr-4">
                          <div className="flex gap-2">
                            <Link href={`/akun-ml/${item.id}`}>
                                <Button variant="secondary">Lihat</Button>
                            </Link>

                            <Link href={`/seller/accounts/${item.id}/edit`}>
                                <Button>Edit</Button>
                            </Link>

                            <Button variant="danger" onClick={() => handleDelete(item.id)}>
                                Hapus
                            </Button>
                            </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}