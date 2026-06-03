"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import {
  confirmRekberCompleted,
  disputeRekber,
  getRekberByBuyerId,
  uploadRekberPaymentProof,
} from "@/services/rekber-service";
import { RekberTransaction } from "@/types/rekber";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserRekberPage() {
  const { firebaseUser } = useAuth();

  const [items, setItems] = useState<RekberTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>(
    {}
  );
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  async function loadRekber() {
    if (!firebaseUser) return;

    try {
      setLoading(true);
      const data = await getRekberByBuyerId(firebaseUser.uid);
      setItems(data);
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

  function handleSelectFile(rekberId: string, file: File | null) {
    setSelectedFiles((current) => ({
      ...current,
      [rekberId]: file,
    }));
  }

  async function handleUploadPaymentProof(item: RekberTransaction) {
    if (!firebaseUser) {
      alert("Silakan login terlebih dahulu");
      return;
    }

    const file = selectedFiles[item.id];

    if (!file) {
      alert("Pilih file bukti pembayaran terlebih dahulu");
      return;
    }

    try {
      setUploadingId(item.id);
      await uploadRekberPaymentProof(item.id, firebaseUser.uid, file);
      setSelectedFiles((current) => ({
        ...current,
        [item.id]: null,
      }));
      alert("Bukti pembayaran berhasil diupload. Menunggu verifikasi admin.");
      await loadRekber();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal upload bukti pembayaran";

      alert(message);
    } finally {
      setUploadingId(null);
    }
  }

  async function handleConfirm(id: string) {
    try {
      setActionLoadingId(id);
      await confirmRekberCompleted(id);
      await loadRekber();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal mengonfirmasi rekber";

      alert(message);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDispute(id: string) {
    try {
      setActionLoadingId(id);
      await disputeRekber(id);
      await loadRekber();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal membuka dispute";

      alert(message);
    } finally {
      setActionLoadingId(null);
    }
  }

  function getPaymentStatusLabel(item: RekberTransaction) {
    switch (item.paymentStatus) {
      case "waiting_verification":
        return "Menunggu Verifikasi Admin";
      case "paid":
        return "Sudah Dibayar";
      case "rejected":
        return "Bukti Ditolak";
      case "expired":
        return "Expired";
      case "refunded":
        return "Refunded";
      case "unpaid":
      default:
        return "Belum Dibayar";
    }
  }

  function getStatusLabel(item: RekberTransaction) {
    return item.status.replaceAll("_", " ");
  }

  function canUploadPaymentProof(item: RekberTransaction) {
    return (
      item.status === "waiting_payment" &&
      (item.paymentStatus === "unpaid" || item.paymentStatus === "rejected")
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Transaksi Rekber Saya
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Pantau pembayaran, upload bukti transfer, konfirmasi akun, dan buka
          dispute jika transaksi bermasalah.
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-slate-500">
            Memuat rekber...
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-slate-500">
            Belum ada transaksi rekber.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const isUploading = uploadingId === item.id;
            const isActionLoading = actionLoadingId === item.id;

            return (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <CardTitle>{item.itemName}</CardTitle>
                      <p className="mt-1 text-sm text-slate-500">
                        Invoice: {item.invoice}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {formatRupiah(item.totalAmount)}
                      </p>
                      <p className="mt-1 text-xs capitalize text-slate-500">
                        Status: {getStatusLabel(item)}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Status Pembayaran
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {getPaymentStatusLabel(item)}
                    </p>

                    {item.paymentRejectedReason ? (
                      <p className="mt-2 text-sm text-red-600">
                        Alasan penolakan: {item.paymentRejectedReason}
                      </p>
                    ) : null}
                  </div>

                  {canUploadPaymentProof(item) ? (
                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-sm font-semibold text-slate-900">
                        Upload Bukti Pembayaran
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Upload gambar bukti transfer. Format yang didukung:
                        JPG, JPEG, PNG, WEBP. Maksimal 5 MB.
                      </p>

                      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          disabled={isUploading}
                          onChange={(event) =>
                            handleSelectFile(
                              item.id,
                              event.target.files?.[0] ?? null
                            )
                          }
                          className="block w-full rounded-xl border border-slate-200 text-sm file:mr-4 file:border-0 file:bg-slate-900 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-white"
                        />

                        <Button
                          type="button"
                          disabled={isUploading}
                          onClick={() => handleUploadPaymentProof(item)}
                        >
                          {isUploading ? "Mengupload..." : "Upload Bukti"}
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {item.paymentStatus === "waiting_verification" ? (
                    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                      Bukti pembayaran sudah dikirim dan sedang menunggu
                      verifikasi admin.
                    </div>
                  ) : null}

                  {item.paymentProofUrl ? (
                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-sm font-semibold text-slate-900">
                        Bukti Pembayaran
                      </p>

                      <img
                        src={item.paymentProofUrl}
                        alt="Bukti pembayaran"
                        className="mt-3 max-h-80 rounded-xl border border-slate-200 object-contain"
                      />
                    </div>
                  ) : null}

                  {item.status === "holding_fund" ? (
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                      Dana sudah ditahan oleh NextPay. Menunggu penjual
                      menyerahkan akun.
                    </div>
                  ) : null}

                  {item.status === "waiting_confirmation" ? (
                    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row">
                      <Button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handleDispute(item.id)}
                      >
                        Dispute
                      </Button>

                      <Button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handleConfirm(item.id)}
                      >
                        Konfirmasi Selesai
                      </Button>
                    </div>
                  ) : null}

                  {item.status === "dispute" ? (
                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
                      Transaksi sedang dalam dispute dan menunggu keputusan
                      admin.
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}