"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getPublishedAccountListings } from "@/services/account-listing-service";
import { AccountGame, AccountListing } from "@/types/account-listing";
import { Card, CardContent } from "@/components/ui/card";

type SortOption = "newest" | "price_low" | "price_high";
type GameFilter = "all" | AccountGame;

const games: { label: string; value: GameFilter }[] = [
  { label: "Semua Game", value: "all" },
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

export default function AccountMarketplacePage() {
  const [items, setItems] = useState<AccountListing[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [gameFilter, setGameFilter] = useState<GameFilter>("all");
  const [sort, setSort] = useState<SortOption>("newest");

  async function loadData() {
    try {
      setLoading(true);

      const data = await getPublishedAccountListings();
      setItems(data);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil akun marketplace");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    let result = items.filter((item) => {
      const matchKeyword =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.rank?.toLowerCase().includes(keyword);

      const matchGame = gameFilter === "all" || item.game === gameFilter;

      return matchKeyword && matchGame;
    });

    if (sort === "price_low") {
      result = [...result].sort((a, b) => a.price - b.price);
    }

    if (sort === "price_high") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [items, search, gameFilter, sort]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">
          Marketplace Akun Game
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Beli akun game menggunakan rekber internal NextPay.
        </p>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_220px_220px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari akun, rank, skin, atau deskripsi..."
            className="h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
          />

          <select
            value={gameFilter}
            onChange={(event) => setGameFilter(event.target.value as GameFilter)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500"
          >
            {games.map((game) => (
              <option key={game.value} value={game.value}>
                {game.label}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500"
          >
            <option value="newest">Terbaru</option>
            <option value="price_low">Harga Terendah</option>
            <option value="price_high">Harga Tertinggi</option>
          </select>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-slate-500">Memuat data akun...</p>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-slate-950">
              Akun tidak ditemukan
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Coba ubah keyword pencarian atau filter game.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => {
            const imageUrl = item.images?.[0];

            return (
              <Link
                key={item.id}
                href={`/akun-ml/${item.id}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="h-48 w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-slate-100 text-sm text-slate-400">
                    No Image
                  </div>
                )}

                <div className="space-y-3 p-4">
                  <p className="text-xs font-medium text-blue-600">
                    {formatGameName(item.game)}
                  </p>

                  <div>
                    <h2 className="line-clamp-1 font-semibold text-slate-950">
                      {item.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <Info label="Rank" value={item.rank || "-"} />
                    <Info label="Skin" value={String(item.skins ?? "-")} />
                    <Info label="Hero" value={String(item.heroes ?? "-")} />
                  </div>

                  <p className="text-lg font-bold text-slate-950">
                    {formatRupiah(item.price)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-2">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 truncate font-medium text-slate-700">{value}</p>
    </div>
  );
}