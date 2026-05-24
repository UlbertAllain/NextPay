"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import {
  getPublishedMlAccounts,
  PublicMlAccount,
} from "@/services/ml-account-service";

import { formatRupiah } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AkunMlPage() {
  const [accounts, setAccounts] = useState<PublicMlAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const data = await getPublishedMlAccounts();
        setAccounts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadAccounts();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">
            Marketplace Akun ML
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Cari akun Mobile Legends berdasarkan rank, jumlah skin, hero, dan
            status verifikasi seller.
          </p>
        </div>

        <Button>Jual Akun ML</Button>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4">
          <Search size={18} className="text-slate-400" />
          <input
            placeholder="Cari akun berdasarkan rank, skin, atau harga..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <Button variant="secondary" className="h-11 gap-2">
          <SlidersHorizontal size={18} />
          Filter
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Memuat data akun...</p>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-slate-500">
            Belum ada akun ML yang dipublish.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {accounts.map((account) => (
            <Link key={account.id} href={`/akun-ml/${account.id}`}>
              <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-md">
                <div className="h-44 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800" />
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {account.rank}
                    </span>
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                      {account.verified ? "Verified" : "Unverified"}
                    </span>
                  </div>

                  <h2 className="font-semibold text-slate-950">
                    {account.title}
                  </h2>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-slate-500">Skin</p>
                      <p className="font-semibold">{account.skins}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-slate-500">Hero</p>
                      <p className="font-semibold">{account.heroes}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-lg font-bold text-slate-950">
                    {formatRupiah(account.price)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}