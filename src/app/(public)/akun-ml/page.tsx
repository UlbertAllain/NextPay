"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { getPublishedAccountListings } from "@/services/account-listing-service";
import { AccountGame, AccountListing } from "@/types/account-listing";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const gameFilters: {
  label: string;
  value: "all" | AccountGame;
}[] = [
  { label: "Semua", value: "all" },
  { label: "Mobile Legends", value: "mobile-legends" },
  { label: "PUBG Mobile", value: "pubg-mobile" },
  { label: "Free Fire", value: "free-fire" },
  { label: "Honor of Kings", value: "honor-of-kings" },
];

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

export default function AkunMlPage() {
  const [items, setItems] = useState<AccountListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<"all" | AccountGame>("all");
  const [search, setSearch] = useState("");

  async function loadListings() {
    try {
      setLoading(true);

      const data = await getPublishedAccountListings();

      setItems(data);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil listing akun");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchGame =
        selectedGame === "all" ? true : item.game === selectedGame;

      const keyword = search.toLowerCase();

      const matchSearch =
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.rank?.toLowerCase().includes(keyword) ||
        formatGameName(item.game).toLowerCase().includes(keyword);

      return matchGame && matchSearch;
    });
  }, [items, selectedGame, search]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">
            Marketplace Akun Game
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Cari akun game dari seller NextPay. Nantinya pembelian akan
            menggunakan sistem rekber agar dana buyer ditahan sampai akun
            diterima.
          </p>
        </div>

        <Link href="/seller/accounts">
          <Button>Jual Akun Game</Button>
        </Link>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4">
          <Search size={18} className="text-slate-400" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari akun berdasarkan judul, rank, game..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <Button variant="secondary" className="h-11 gap-2">
          <SlidersHorizontal size={18} />
          Filter
        </Button>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {gameFilters.map((filter) => {
          const isActive = selectedGame === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setSelectedGame(filter.value)}
              className={[
                "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition",
                isActive
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600",
              ].join(" ")}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-5">
                <div className="mb-4 h-44 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-5 w-2/3 animate-pulse rounded bg-slate-100" />
                <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                <div className="mt-6 h-10 w-full animate-pulse rounded-xl bg-slate-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="font-semibold text-slate-950">
              Belum ada listing akun
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Listing akun yang sudah dipublish seller akan muncul di sini.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {filteredItems.map((item) => (
            <Link key={item.id} href={`/akun-ml/${item.id}`}>
              <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-44 items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
                  <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white">
                    {formatGameName(item.game)}
                  </span>
                </div>

                <CardContent className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {item.rank || "No Rank"}
                    </span>

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
                  </div>

                  <h2 className="line-clamp-2 font-semibold text-slate-950">
                    {item.title}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-slate-500">Skin</p>
                      <p className="font-semibold">{item.skins ?? "-"}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-slate-500">Hero</p>
                      <p className="font-semibold">{item.heroes ?? "-"}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <p className="text-lg font-bold text-slate-950">
                      {formatRupiah(item.price)}
                    </p>

                    <span className="text-sm font-medium text-blue-600">
                      Detail
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}