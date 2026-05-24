"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {createOrder, createPaymentForOrder,} from "@/services/order-service";
import { useAuth } from "@/components/providers/auth-provider";
import { formatRupiah } from "@/lib/format";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const nominals = [
  { name: "11 Diamond", price: 3000 },
  { name: "22 Diamond", price: 6000 },
  { name: "36 Diamond", price: 10000 },
  { name: "86 Diamond", price: 23000 },
  { name: "172 Diamond", price: 45000 },
  { name: "257 Diamond", price: 66000 },
  { name: "344 Diamond", price: 86000 },
  { name: "429 Diamond", price: 105000 },
];

export default function TopupDetailPage() {
  const router = useRouter();
  const params = useParams<{ game: string }>();
  const { firebaseUser } = useAuth();

  const [userId, setUserId] = useState("");
  const [serverId, setServerId] = useState("");
  const [selectedNominal, setSelectedNominal] = useState(nominals[3]);
  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [loading, setLoading] = useState(false);

  const gameName = params.game
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");

  async function handleCheckout() {
    if (!firebaseUser) {
      router.push("/login");
      return;
    }

    if (!userId) {
      alert("User ID wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const order = await createOrder({
  userId: firebaseUser.uid,
  type: "topup",
  title: `Top Up ${gameName} - ${selectedNominal.name}`,
  amount: selectedNominal.price,
  adminFee: 1000,
});

const payment = await createPaymentForOrder(order);

router.push(payment.checkoutUrl);
    } catch (error) {
      console.error(error);
      alert("Gagal membuat order");
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
                  onChange={(e) => setUserId(e.target.value)}
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
                  onChange={(e) => setServerId(e.target.value)}
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
                const active = selectedNominal.name === nominal.name;

                return (
                  <button
                    key={nominal.name}
                    onClick={() => setSelectedNominal(nominal)}
                    className={[
                      "rounded-xl border p-4 text-left transition",
                      active
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50",
                    ].join(" ")}
                  >
                    <p className="font-medium text-slate-950">
                      {nominal.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatRupiah(nominal.price)}
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
              {["QRIS", "Virtual Account", "E-Wallet"].map((method) => {
                const active = paymentMethod === method;

                return (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={[
                      "rounded-xl border p-4 text-left transition",
                      active
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50",
                    ].join(" ")}
                  >
                    <p className="font-medium text-slate-950">{method}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Diproses via Tripay
                    </p>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle>Ringkasan Pesanan</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Summary label="Game" value={gameName} />
            <Summary label="User ID" value={userId || "-"} />
            <Summary label="Server ID" value={serverId || "-"} />
            <Summary label="Nominal" value={selectedNominal.name} />
            <Summary label="Pembayaran" value={paymentMethod} />
            <Summary label="Harga" value={formatRupiah(selectedNominal.price)} />
            <Summary label="Admin Fee" value={formatRupiah(1000)} />

            <div className="flex justify-between border-t border-slate-200 pt-4 text-sm">
              <span className="text-slate-500">Total Bayar</span>
              <span className="font-bold text-slate-950">
                {formatRupiah(selectedNominal.price + 1000)}
              </span>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="h-11 w-full"
            >
              {loading ? "Membuat Order..." : "Lanjut ke Pembayaran"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-950">{value}</span>
    </div>
  );
}