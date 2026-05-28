"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { getAccountListingById } from "@/services/account-listing-service";
import { createRekberTransaction } from "@/services/rekber-service";
import { AccountListing } from "@/types/account-listing";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

function getStatusLabel(status: string) {
  switch (status) {
    case "published":
      return "Tersedia";
    case "reserved":
      return "Sedang dalam transaksi";
    case "sold":
      return "Terjual";
    case "hidden":
      return "Disembunyikan";
    case "rejected":
      return "Ditolak";
    case "draft":
      return "Draft";
    case "pending_review":
      return "Menunggu review";
    default:
      return formatStatus(status);
  }
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

export default function AccountListingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { firebaseUser } = useAuth();

  const [item, setItem] = useState<AccountListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const rekberFee = 10000;

  async function loadData() {
    try {
      setLoading(true);

      const data = await getAccountListingById(params.id);
      setItem(data);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil detail akun");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [params.id]);

  async function handleBuyWithRekber() {
    if (!firebaseUser) {
      router.push("/login");
      return;
    }

    if (!item) return;

    if (item.status !== "published") {
      alert("Listing ini tidak tersedia untuk dibeli");
      return;
    }

    if (item.sellerId === firebaseUser.uid) {
      alert("Kamu tidak bisa membeli listing milik sendiri");
      return;
    }

    try {
      setCheckoutLoading(true);

      const rekber = await createRekberTransaction({
        buyerId: firebaseUser.uid,
        sellerId: item.sellerId,
        sellerContact: `internal-seller:${item.sellerId}`,
        itemName: item.title,
        itemDescription: `Pembelian listing akun ${formatGameName(
          item.game
        )}.\n${item.description}`,
        amount: item.price,
        fee: rekberFee,
        sourceType: "account_listing",
        sourceId: item.id,
      });

      router.push(`/mock-rekber-payment/${rekber.id}`);
    } catch (error) {
      console.error(error);
      alert("Gagal membuat transaksi rekber");
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Memuat detail akun...</p>;
  }

  if (!item) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-950">
          Akun tidak ditemukan
        </h1>
        <p className="text-sm text-slate-500">
          Listing akun ini tidak tersedia atau sudah dihapus.
        </p>
      </div>
    );
  }

  const totalPayment = item.price + rekberFee;
  const isAvailable = item.status === "published";
  const isOwnListing = firebaseUser?.uid === item.sellerId;
  const isBuyDisabled = checkoutLoading || !isAvailable || isOwnListing;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <p className="text-sm font-medium text-blue-600">
              {formatGameName(item.game)}
            </p>
            <CardTitle className="text-2xl">{item.title}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="aspect-video rounded-2xl bg-slate-100" />

            <div className="grid gap-4 sm:grid-cols-4">
              <Info label="Rank" value={item.rank || "-"} />
              <Info label="Level" value={String(item.level ?? "-")} />
              <Info label="Skin" value={String(item.skins ?? "-")} />
              <Info label="Hero" value={String(item.heroes ?? "-")} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-950">Deskripsi</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <h2 className="font-semibold text-blue-950">Catatan Keamanan</h2>
              <p className="mt-2 text-sm leading-6 text-blue-800">
                Data login akun tidak ditampilkan sebelum transaksi rekber
                dibuat dan pembayaran berhasil. Dana buyer akan ditahan oleh
                NextPay sampai seller menyerahkan akun dan buyer mengonfirmasi
                transaksi selesai. Jika ada masalah, buyer dapat membuka dispute
                dan admin akan memeriksa transaksi.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Checkout Rekber</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <p className="text-sm text-slate-500">Status Listing</p>
            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadgeClass(
                item.status
              )}`}
            >
              {getStatusLabel(item.status)}
            </span>
          </div>

          <div>
            <p className="text-sm text-slate-500">Harga Akun</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {formatRupiah(item.price)}
            </p>
          </div>

          <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Harga Item</span>
              <span className="font-medium">{formatRupiah(item.price)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Fee Rekber</span>
              <span className="font-medium">{formatRupiah(rekberFee)}</span>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-950">
                  Total Bayar
                </span>
                <span className="font-bold text-slate-950">
                  {formatRupiah(totalPayment)}
                </span>
              </div>
            </div>
          </div>

          {!isAvailable && (
            <p className="rounded-xl bg-orange-50 p-3 text-sm text-orange-700">
              Listing ini sedang tidak tersedia untuk dibeli.
            </p>
          )}

          {isOwnListing && (
            <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">
              Kamu tidak bisa membeli listing milik sendiri.
            </p>
          )}

          <Button
            className="w-full"
            onClick={handleBuyWithRekber}
            disabled={isBuyDisabled}
          >
            {checkoutLoading ? "Memproses..." : "Beli dengan Rekber"}
          </Button>

          <p className="text-xs leading-5 text-slate-500">
            Pembelian akun ini akan dibuat sebagai transaksi rekber internal.
            Seller akan otomatis menerima order setelah pembayaran buyer
            berhasil.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}