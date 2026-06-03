"use client";

import { useEffect, useState } from "react";

import {
  getAllAccountListings,
  hideAccountListing,
  publishAccountListing,
  rejectAccountListing,
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

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "published":
      return "bg-green-50 text-green-700";
    case "reserved":
      return "bg-orange-50 text-orange-700";
    case "sold":
      return "bg-slate-100 text-slate-700";
    case "hidden":
      return "bg-slate-100 text-slate-700";
    case "rejected":
      return "bg-red-50 text-red-700";
    case "pending_review":
      return "bg-blue-50 text-blue-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function AdminListingsPage() {
  const [items, setItems] = useState<AccountListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  async function loadListings() {
    try {
      setLoading(true);

      const data = await getAllAccountListings();
      setItems(data);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data Akun Marketplace");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

  async function handlePublish(id: string) {
    const confirmed = confirm("Publish akun ini ke marketplace?");

    if (!confirmed) return;

    try {
      setActionLoadingId(id);
      await publishAccountListing(id);
      await loadListings();
    } catch (error) {
      console.error(error);
      alert("Gagal publish akun");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleHide(id: string) {
    const confirmed = confirm("Sembunyikan akun ini dari marketplace?");

    if (!confirmed) return;

    try {
      setActionLoadingId(id);
      await hideAccountListing(id);
      await loadListings();
    } catch (error) {
      console.error(error);
      alert("Gagal hide akun");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReject(id: string) {
    const confirmed = confirm("Reject akun ini?");

    if (!confirmed) return;

    try {
      setActionLoadingId(id);
      await rejectAccountListing(id);
      await loadListings();
    } catch (error) {
      console.error(error);
      alert("Gagal reject akun");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">
          Admin Akun Moderation
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Kelola akun game yang muncul di marketplace NextPay.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semua Akun</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Memuat daftar akun...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada daftar akun game.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-3 pr-4 font-medium">Akun</th>
                    <th className="py-3 pr-4 font-medium">Seller</th>
                    <th className="py-3 pr-4 font-medium">Game</th>
                    <th className="py-3 pr-4 font-medium">Harga</th>
                    <th className="py-3 pr-4 font-medium">Rank</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Verified</th>
                    <th className="py-3 pr-4 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => {
                    const imageUrl = item.images?.[0];
                    const isActionLoading = actionLoadingId === item.id;

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
                              <p className="mt-1 max-w-xs break-all text-xs text-slate-400">
                                ID: {item.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 pr-4">
                          <p className="max-w-[180px] break-all text-xs text-slate-600">
                            {item.sellerId}
                          </p>
                        </td>

                        <td className="py-4 pr-4">
                          {formatGameName(item.game)}
                        </td>

                        <td className="py-4 pr-4 font-semibold text-slate-950">
                          {formatRupiah(item.price)}
                        </td>

                        <td className="py-4 pr-4">{item.rank || "-"}</td>

                        <td className="py-4 pr-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadgeClass(
                              item.status
                            )}`}
                          >
                            {formatStatus(item.status)}
                          </span>
                        </td>

                        <td className="py-4 pr-4">
                          {item.verified ? "Verified" : "Unverified"}
                        </td>

                        <td className="py-4 pr-4">
                          <div className="flex min-w-[180px] flex-col gap-2">
                            {item.status !== "published" && (
                              <Button
                                onClick={() => handlePublish(item.id)}
                                disabled={isActionLoading}
                              >
                                Publish
                              </Button>
                            )}

                            {item.status !== "hidden" && (
                              <Button
                                variant="secondary"
                                onClick={() => handleHide(item.id)}
                                disabled={isActionLoading}
                              >
                                Hide
                              </Button>
                            )}

                            {item.status !== "rejected" && (
                              <Button
                                variant="danger"
                                onClick={() => handleReject(item.id)}
                                disabled={isActionLoading}
                              >
                                Reject
                              </Button>
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