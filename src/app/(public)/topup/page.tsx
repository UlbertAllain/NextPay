import Link from "next/link";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const games = [
  {
    slug: "mobile-legends",
    name: "Mobile Legends",
    publisher: "Moonton",
    startPrice: "Rp 1.250",
  },
  {
    slug: "pubg-mobile",
    name: "PUBG Mobile",
    publisher: "Tencent Games",
    startPrice: "Rp 7.150",
  },
  {
    slug: "honor-of-kings",
    name: "Honor of Kings",
    publisher: "Level Infinite",
    startPrice: "Rp 5.150",
  },
  {
    slug: "free-fire",
    name: "Free Fire",
    publisher: "Garena",
    startPrice: "Rp 1.500",
  },
];

export default function TopupPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Top Up Game</h1>
          <p className="mt-2 text-slate-600">
            Pilih game, masukkan ID, lalu bayar dengan metode pembayaran yang tersedia.
          </p>
        </div>

        <div className="flex h-11 w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 md:w-80">
          <Search size={18} className="text-slate-400" />
          <input
            placeholder="Cari game..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {games.map((game) => (
          <Link key={game.slug} href={`/topup/${game.slug}`}>
            <Card className="transition hover:-translate-y-1 hover:shadow-md">
              <CardContent className="p-5">
                <div className="mb-4 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-slate-100" />
                <h2 className="font-semibold text-slate-950">{game.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{game.publisher}</p>
                <p className="mt-4 text-sm font-medium text-blue-600">
                  Mulai dari {game.startPrice}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}