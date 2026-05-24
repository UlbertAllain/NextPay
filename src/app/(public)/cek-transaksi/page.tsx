import { Search } from "lucide-react";
import { transactions } from "@/constants/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CekTransaksiPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-950">Cek Transaksi</h1>
        <p className="mt-2 text-slate-600">
          Masukkan nomor invoice untuk melihat status transaksi.
        </p>
      </div>

      <Card>
        <CardContent className="grid gap-3 p-5 md:grid-cols-[1fr_auto]">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4">
            <Search size={18} className="text-slate-400" />
            <input
              placeholder="Contoh: NPY-2026-0001"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <Button className="h-11">Cek Status</Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Contoh Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {transactions.map((trx) => (
            <div
              key={trx.invoice}
              className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center"
            >
              <div>
                <p className="font-semibold text-slate-950">{trx.invoice}</p>
                <p className="text-sm text-slate-500">{trx.product}</p>
              </div>

              <div className="text-left md:text-right">
                <p className="font-semibold text-slate-950">{trx.total}</p>
                <p className="text-sm text-blue-600">{trx.status}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}