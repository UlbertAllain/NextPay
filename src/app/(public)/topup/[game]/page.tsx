"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { createOrder, createPaymentForOrder } from "@/services/order-service";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const gameProducts: Record<
  string,
  {
    name: string;
    price: number;
    productCode: string;
  }[]
> = {
  "mobile-legends": [
    { name: "11 Diamond", price: 3000, productCode: "ML11" },
    { name: "22 Diamond", price: 6000, productCode: "ML22" },
    { name: "36 Diamond", price: 10000, productCode: "ML36" },
    { name: "86 Diamond", price: 23000, productCode: "ML86" },
    { name: "172 Diamond", price: 45000, productCode: "ML172" },
    { name: "257 Diamond", price: 66000, productCode: "ML257" },
    { name: "344 Diamond", price: 86000, productCode: "ML344" },
    { name: "429 Diamond", price: 105000, productCode: "ML429" },
  ],
  "pubg-mobile": [
    { name: "60 UC", price: 14500, productCode: "PUBG60" },
    { name: "325 UC", price: 71000, productCode: "PUBG325" },
    { name: "660 UC", price: 142000, productCode: "PUBG660" },
    { name: "1800 UC", price: 355000, productCode: "PUBG1800" },
  ],
  "honor-of-kings": [
    { name: "80 Tokens", price: 15000, productCode: "HOK80" },
    { name: "240 Tokens", price: 43000, productCode: "HOK240" },
    { name: "400 Tokens", price: 71000, productCode: "HOK400" },
    { name: "800 Tokens", price: 142000, productCode: "HOK800" },
  ],
  "free-fire": [
    { name: "70 Diamond", price: 10000, productCode: "FF70" },
    { name: "140 Diamond", price: 20000, productCode: "FF140" },
    { name: "355 Diamond", price: 50000, productCode: "FF355" },
    { name: "720 Diamond", price: 100000, productCode: "FF720" },
  ],
};

function formatGameName(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function TopupDetailPage() {
  const router = useRouter();
  const params = useParams<{ game: string }>();
  const { firebaseUser } = useAuth();

  const gameSlug = params.game;
  const gameName = useMemo(() => formatGameName(gameSlug), [gameSlug]);
  const nominals = gameProducts[gameSlug] ?? gameProducts["mobile-legends"];

  const [userId, setUserId] = useState("");
  const [serverId, setServerId] = useState("");
  const [selectedNominal, setSelectedNominal] = useState(nominals[0]);
  const [loading, setLoading] = useState(false);

  const adminFee = 1000;
  const totalAmount = selectedNominal.price + adminFee;

  async function handleCheckout() {
    if (!firebaseUser) {
      router.push("/login");
      return;
    }

    if (!userId.trim()) {
      alert("User ID wajib diisi");
      return;
    }

    if (!serverId.trim()) {
      alert("Server ID wajib diisi");
      return;
    }

    if (!selectedNominal.productCode) {
      alert("Product code tidak valid");
      return;
    }

    try {
      setLoading(true);

      const order = await createOrder({
        userId: firebaseUser.uid,
        type: "topup",
        title: `Top Up ${gameName} - ${selectedNominal.name}`,
        amount: selectedNominal.price,
        adminFee,
        gameSlug,
        targetUserId: userId.trim(),
        serverId: serverId.trim(),
        productCode: selectedNominal.productCode,
      });

      const payment = await createPaymentForOrder(order);

      router.push(payment.checkoutUrl);
    } catch (error) {
      console.error(error);
      alert("Gagal membuat order topup");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm text-slate-500">Top Up Game</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Top Up {gameName}
        </h1>
        <p className="mt-2 text-slate-600">
          Masukkan data akun, pilih nominal, lalu lanjutkan pembayaran.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Masukkan Data Akun</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  User ID
                </label>
                <input
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  placeholder="Masukkan User ID"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Server ID
                </label>
                <input
                  value={serverId}
                  onChange={(event) => setServerId(event.target.value)}
                  placeholder="Contoh: 1234"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Pilih Nominal</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {nominals.map((nominal) => {
                const isSelected =
                  selectedNominal.productCode === nominal.productCode;

                return (
                  <button
                    key={nominal.productCode}
                    type="button"
                    onClick={() => setSelectedNominal(nominal)}
                    className={[
                      "rounded-xl border p-4 text-left transition",
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50",
                    ].join(" ")}
                  >
                    <p className="font-medium text-slate-950">
                      {nominal.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatRupiah(nominal.price)}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {nominal.productCode}
                    </p>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Pilih Pembayaran</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-3 md:grid-cols-3">
              {["QRIS", "Virtual Account", "E-Wallet"].map((method) => (
                <button
                  key={method}
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-500 hover:bg-blue-50"
                >
                  <p className="font-medium text-slate-950">{method}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Diproses via mock payment
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle>Ringkasan Pesanan</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Game</span>
              <span className="font-medium">{gameName}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">User ID</span>
              <span className="font-medium">{userId || "-"}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Server ID</span>
              <span className="font-medium">{serverId || "-"}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Nominal</span>
              <span className="font-medium">{selectedNominal.name}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Product Code</span>
              <span className="font-medium">{selectedNominal.productCode}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Harga</span>
              <span className="font-medium">
                {formatRupiah(selectedNominal.price)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Admin Fee</span>
              <span className="font-medium">{formatRupiah(adminFee)}</span>
            </div>

            <div className="flex justify-between border-t border-slate-200 pt-4 text-sm">
              <span className="text-slate-500">Total Bayar</span>
              <span className="font-bold text-slate-950">
                {formatRupiah(totalAmount)}
              </span>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="h-11 w-full"
            >
              {loading ? "Memproses..." : "Lanjut ke Pembayaran"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}