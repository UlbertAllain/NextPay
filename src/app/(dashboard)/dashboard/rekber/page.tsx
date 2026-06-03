"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import {
  confirmRekberCompleted,
  disputeRekber,
  getRekberByBuyerId,
} from "@/services/rekber-service";
import {
  createSellerReview,
  getReviewByRekberAndBuyer,
} from "@/services/seller-review-service";

import { RekberTransaction } from "@/types/rekber";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "waiting_payment":
      return "bg-slate-100 text-slate-700";
    case "holding_fund":
      return "bg-blue-50 text-blue-700";
    case "waiting_confirmation":
      return "bg-orange-50 text-orange-700";
    case "completed":
      return "bg-green-50 text-green-700";
    case "dispute":
      return "bg-red-50 text-red-700";
    case "refunded":
      return "bg-purple-50 text-purple-700";
    case "cancelled":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getBuyerStatusText(status: string) {
  switch (status) {
    case "waiting_payment":
      return "Menunggu pembayaran";
    case "holding_fund":
      return "Dana sudah ditahan. Menunggu seller mengirim item.";
    case "waiting_confirmation":
      return "Seller sudah mengirim item. Silakan cek dan konfirmasi.";
    case "completed":
      return "Transaksi selesai.";
    case "dispute":
      return "Transaksi sedang dalam dispute dan menunggu keputusan admin.";
    case "refunded":
      return "Dana sudah dikembalikan.";
    case "cancelled":
      return "Transaksi dibatalkan karena pembayaran melewati batas waktu.";
    default:
      return "-";
  }
}

export default function UserRekberPage() {
  const { firebaseUser } = useAuth();

  const [items, setItems] = useState<RekberTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [reviewRatings, setReviewRatings] = useState<Record<string, number>>(
    {}
  );

  const [reviewComments, setReviewComments] = useState<
    Record<string, string>
  >({});

  const [submittedReviews, setSubmittedReviews] = useState<
    Record<string, boolean>
  >({});

  async function loadRekber() {
    if (!firebaseUser) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getRekberByBuyerId(firebaseUser.uid);

      setItems(data);

      const reviewMap: Record<string, boolean> = {};

      for (const item of data) {
        const review = await getReviewByRekberAndBuyer(
          item.id,
          firebaseUser.uid
        );

        reviewMap[item.id] = !!review;
      }

      setSubmittedReviews(reviewMap);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data rekber");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRekber();
  }, [firebaseUser]);

  async function handleConfirm(id: string) {
    const confirmed = confirm(
      "Konfirmasi transaksi selesai? Dana akan langsung dirilis ke Penjual."
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(id);

      await confirmRekberCompleted(id);
      await loadRekber();
    } catch (error) {
      console.error(error);
      alert("Gagal mengonfirmasi transaksi");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDispute(id: string) {
    const confirmed = confirm(
      "Buka dispute untuk transaksi ini? Admin akan memeriksa transaksi."
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(id);

      await disputeRekber(id);
      await loadRekber();
    } catch (error) {
      console.error(error);
      alert("Gagal membuka dispute");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleSubmitReview(item: RekberTransaction) {
    if (!firebaseUser) return;

    const rating = reviewRatings[item.id] || 5;
    const comment = reviewComments[item.id] || "";

    if (!item.sellerId) {
      alert("Penjual tidak ditemukan");
      return;
    }

    try {
      setActionLoadingId(item.id);

      await createSellerReview({
        rekberId: item.id,
        buyerId: firebaseUser.uid,
        sellerId: item.sellerId,
        rating,
        comment,
      });

      await loadRekber();
    } catch (error) {
      console.error(error);
      alert("Gagal mengirim review");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">
          Transaksi Rekber Saya
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Pantau transaksi rekber akun game yang kamu beli di marketplace
          NextPay.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Memuat rekber...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada transaksi rekber.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const isActionLoading = actionLoadingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold text-slate-950">
                            {item.itemName}
                          </h2>

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadgeClass(
                              item.status
                            )}`}
                          >
                            {formatStatus(item.status)}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500">
                          Invoice: {item.invoice}
                        </p>

                        <p className="max-w-2xl whitespace-pre-line text-sm leading-6 text-slate-600">
                          {item.itemDescription || "-"}
                        </p>

                        <p className="text-sm text-slate-500">
                          {getBuyerStatusText(item.status)}
                        </p>

                        {item.status === "completed" &&
                          !submittedReviews[item.id] && (
                            <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                              <h3 className="font-semibold text-slate-950">
                                Beri Review Penjual untuk Transaksi Ini
                              </h3>

                              <div className="mt-4">
                                <label className="text-sm font-medium text-slate-700">
                                  Rating
                                </label>

                                <select
                                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                                  value={reviewRatings[item.id] || 5}
                                  onChange={(event) =>
                                    setReviewRatings((prev) => ({
                                      ...prev,
                                      [item.id]: Number(event.target.value),
                                    }))
                                  }
                                >
                                  <option value={5}>5 - Sangat Bagus</option>
                                  <option value={4}>4 - Bagus</option>
                                  <option value={3}>3 - Normal</option>
                                  <option value={2}>2 - Buruk</option>
                                  <option value={1}>1 - Sangat Buruk</option>
                                </select>
                              </div>

                              <div className="mt-4">
                                <label className="text-sm font-medium text-slate-700">
                                  Komentar
                                </label>

                                <textarea
                                  className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                                  placeholder="Bagikan pengalaman transaksi dengan penjual ini..."
                                  value={reviewComments[item.id] || ""}
                                  onChange={(event) =>
                                    setReviewComments((prev) => ({
                                      ...prev,
                                      [item.id]: event.target.value,
                                    }))
                                  }
                                />
                              </div>

                              <Button
                                className="mt-4"
                                onClick={() => handleSubmitReview(item)}
                                disabled={isActionLoading}
                              >
                                {isActionLoading
                                  ? "Mengirim..."
                                  : "Kirim Review"}
                              </Button>
                            </div>
                          )}

                        {item.status === "completed" &&
                          submittedReviews[item.id] && (
                            <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
                              Kamu sudah memberikan review untuk transaksi ini.
                            </div>
                          )}
                      </div>

                      <div className="min-w-[220px] space-y-3 rounded-2xl bg-slate-50 p-4">
                        <div>
                          <p className="text-xs text-slate-500">
                            Total Bayar
                          </p>

                          <p className="mt-1 font-bold text-slate-950">
                            {formatRupiah(item.totalAmount)}
                          </p>
                        </div>

                        <div className="space-y-2">
                          {item.status === "waiting_payment" && (
                            <Button
                              className="w-full"
                              onClick={() => {
                                window.location.href = `/mock-rekber-payment/${item.id}`;
                              }}
                            >
                              Lanjut Bayar
                            </Button>
                          )}

                          {item.status === "waiting_confirmation" && (
                            <>
                              <Button
                                className="w-full"
                                onClick={() => handleConfirm(item.id)}
                                disabled={isActionLoading}
                              >
                                {isActionLoading
                                  ? "Memproses..."
                                  : "Konfirmasi Selesai"}
                              </Button>

                              <Button
                                className="w-full"
                                onClick={() => handleDispute(item.id)}
                                disabled={isActionLoading}
                              >
                                Buka Dispute
                              </Button>
                            </>
                          )}

                          {item.status === "holding_fund" && (
                            <Button
                              className="w-full"
                              onClick={() => handleDispute(item.id)}
                              disabled={isActionLoading}
                            >
                              Buka Dispute
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}