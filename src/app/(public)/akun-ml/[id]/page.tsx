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
          )}. ${item.description}`,
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
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <p className="text-sm text-slate-500">Memuat detail akun...</p>
      </section>
    );
  }

  if (!item) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-xl font-bold text-slate-950">
              Akun tidak ditemukan
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Listing akun ini tidak tersedia atau sudah dihapus.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  const totalPayment = item.price + rekberFee;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="flex h-96 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
            <span className="rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white">
              {formatGameName(item.game)}
            </span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detail Akun</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-4">
              <Info label="Game" value={formatGameName(item.game)} />
              <Info label="Rank" value={item.rank || "-"} />
              <Info label="Skin" value={`${item.skins ?? "-"}`} />
              <Info label="Hero" value={`${item.heroes ?? "-"}`} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deskripsi Seller</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm leading-7 text-slate-600">
                {item.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Catatan Keamanan</CardTitle>
            </CardHeader>

            <CardContent className="space-y-2 text-sm leading-6 text-slate-600">
              <p>
                Data login akun tidak ditampilkan sebelum transaksi rekber
                dibuat dan pembayaran berhasil.
              </p>
              <p>
                Dana buyer akan ditahan oleh NextPay sampai seller menyerahkan
                akun dan buyer mengonfirmasi transaksi selesai.
              </p>
              <p>
                Jika ada masalah, buyer dapat membuka dispute dan admin akan
                memeriksa transaksi.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex items-center gap-2">
              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-medium",
                  item.verified
                    ? "bg-green-50 text-green-700"
                    : "bg-slate-100 text-slate-500",
                ].join(" ")}
              >
                {item.verified ? "Verified" : "Unverified"}
              </span>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-700">
                {item.status.replaceAll("_", " ")}
              </span>
            </div>

            <div>
              <p className="text-sm text-slate-500">Harga Akun</p>
              <p className="mt-1 text-3xl font-bold text-slate-950">
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

              <div className="flex justify-between border-t border-slate-200 pt-3">
                <span className="text-slate-500">Total Bayar</span>
                <span className="font-bold text-slate-950">
                  {formatRupiah(totalPayment)}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-800">
              Pembelian akun ini akan dibuat sebagai transaksi rekber internal.
              Seller akan otomatis menerima order setelah pembayaran buyer
              berhasil.
            </div>

            <Button
              onClick={handleBuyWithRekber}
              disabled={checkoutLoading || item.status !== "published"}
              className="h-11 w-full"
            >
              {checkoutLoading ? "Memproses..." : "Beli dengan Rekber"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}