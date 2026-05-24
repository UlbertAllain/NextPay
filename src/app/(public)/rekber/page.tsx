"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Wallet, CheckCircle2, AlertTriangle } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { createRekberTransaction } from "@/services/rekber-service";
import { formatRupiah } from "@/lib/format";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    title: "Buyer Membuat Transaksi",
    desc: "Buyer mengisi detail item, harga, seller, dan aturan transaksi.",
    icon: ShieldCheck,
  },
  {
    title: "Dana Ditahan NextPay",
    desc: "Buyer membayar invoice, lalu dana disimpan sementara oleh sistem.",
    icon: Wallet,
  },
  {
    title: "Seller Kirim Item",
    desc: "Seller menyerahkan akun atau produk sesuai kesepakatan.",
    icon: CheckCircle2,
  },
  {
    title: "Konfirmasi / Dispute",
    desc: "Buyer konfirmasi selesai atau ajukan dispute jika ada masalah.",
    icon: AlertTriangle,
  },
];

export default function RekberPage() {
  const router = useRouter();
  const { firebaseUser } = useAuth();

  const [itemName, setItemName] = useState("");
  const [amount, setAmount] = useState("");
  const [sellerContact, setSellerContact] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const numericAmount = Number(amount || 0);
  const fee = numericAmount >= 500000 ? 10000 : 5000;
  const total = numericAmount + fee;

  async function handleCreateRekber() {
    if (!firebaseUser) {
      router.push("/login");
      return;
    }

    if (!itemName || !amount || !sellerContact) {
      alert("Nama item, harga, dan kontak seller wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const rekber = await createRekberTransaction({
        buyerId: firebaseUser.uid,
        itemName,
        sellerContact,
        itemDescription,
        amount: numericAmount,
        fee,
      });

      router.push(`/mock-rekber-payment/${rekber.id}`);
    } catch (error) {
      console.error(error);
      alert("Gagal membuat transaksi rekber");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
        <div>
          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            Rekening Bersama
          </span>

          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-950">
            Transaksi akun dan item digital lebih aman dengan rekber.
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            NextPay menahan dana buyer sampai seller menyerahkan item dan buyer
            mengonfirmasi transaksi selesai.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <Card key={step.title}>
                  <CardContent className="p-5">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon size={22} />
                    </div>
                    <h2 className="font-semibold text-slate-950">
                      {step.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {step.desc}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Buat Transaksi Rekber</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input
              label="Nama Item"
              placeholder="Contoh: Akun ML Mythic"
              value={itemName}
              onChange={setItemName}
            />

            <Input
              label="Harga Transaksi"
              placeholder="750000"
              value={amount}
              onChange={setAmount}
            />

            <Input
              label="Username / Kontak Seller"
              placeholder="@seller"
              value={sellerContact}
              onChange={setSellerContact}
            />

            <Input
              label="Catatan"
              placeholder="Detail kesepakatan transaksi"
              value={itemDescription}
              onChange={setItemDescription}
            />

            <div className="rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Fee Rekber</span>
                <span className="font-medium">{formatRupiah(fee)}</span>
              </div>

              <div className="mt-2 flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">Estimasi Total</span>
                <span className="font-bold">{formatRupiah(total)}</span>
              </div>
            </div>

            <Button
              onClick={handleCreateRekber}
              disabled={loading}
              className="h-11 w-full"
            >
              {loading ? "Membuat Rekber..." : "Mulai Rekber"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Input({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
      />
    </div>
  );
}