"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  getMlAccountById,
  PublicMlAccount,
} from "@/services/ml-account-service";

import { formatRupiah } from "@/lib/format";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AkunMlDetailPage() {
  const params = useParams<{ id: string }>();

  const [account, setAccount] = useState<PublicMlAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAccount() {
      try {
        const data = await getMlAccountById(params.id);
        setAccount(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, [params.id]);

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <p className="text-sm text-slate-500">Memuat detail akun...</p>
      </section>
    );
  }

  if (!account) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <Card>
          <CardContent className="p-6 text-sm text-slate-500">
            Akun tidak ditemukan.
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="h-96 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800" />

          <Card>
            <CardHeader>
              <CardTitle>Detail Akun</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <Info label="Rank" value={account.rank} />
              <Info label="Total Skin" value={`${account.skins}`} />
              <Info label="Total Hero" value={`${account.heroes}`} />
              <Info
                label="Status"
                value={account.verified ? "Verified" : "Unverified"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Catatan Keamanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-6 text-slate-600">
              <p>Data login tidak ditampilkan sebelum pembayaran selesai.</p>
              <p>
                Transaksi disarankan memakai rekber agar dana ditahan sampai akun
                diterima buyer.
              </p>
              <p>
                Jika terjadi masalah, buyer dapat membuka dispute dan admin akan
                memeriksa bukti dari kedua pihak.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle>{account.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-sm text-slate-500">Harga</p>
              <p className="mt-1 text-3xl font-bold text-slate-950">
                {formatRupiah(account.price)}
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-800">
              Pembelian akun ML menggunakan sistem rekber NextPay agar dana
              tidak langsung diteruskan ke seller.
            </div>

            <Button className="h-11 w-full">Beli dengan Rekber</Button>
            <Button variant="secondary" className="h-11 w-full">
              Chat Seller
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