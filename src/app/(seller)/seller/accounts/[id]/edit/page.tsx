"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";

import {
  getAccountListingById,
  updateAccountListing,
} from "@/services/account-listing-service";

import { AccountGame, AccountListing } from "@/types/account-listing";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const games: { label: string; value: AccountGame }[] = [
  { label: "Mobile Legends", value: "mobile-legends" },
  { label: "PUBG Mobile", value: "pubg-mobile" },
  { label: "Free Fire", value: "free-fire" },
  { label: "Honor of Kings", value: "honor-of-kings" },
];

export default function EditSellerAccountPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { firebaseUser } = useAuth();

  const [item, setItem] = useState<AccountListing | null>(null);

  const [game, setGame] = useState<AccountGame>("mobile-legends");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [rank, setRank] = useState("");
  const [level, setLevel] = useState("");
  const [skins, setSkins] = useState("");
  const [heroes, setHeroes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    try {
      setLoading(true);

      const data = await getAccountListingById(params.id);

      if (!data) {
        setItem(null);
        return;
      }

      setItem(data);
      setGame(data.game);
      setTitle(data.title);
      setDescription(data.description);
      setPrice(String(data.price));
      setRank(data.rank || "");
      setLevel(data.level ? String(data.level) : "");
      setSkins(data.skins ? String(data.skins) : "");
      setHeroes(data.heroes ? String(data.heroes) : "");
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil detail listing");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [params.id]);

  async function handleSubmit() {
    if (!firebaseUser) {
      router.push("/login");
      return;
    }

    if (!item) return;

    if (item.sellerId !== firebaseUser.uid) {
      alert("Kamu tidak punya akses untuk mengedit listing ini");
      return;
    }

    if (!title.trim()) {
      alert("Judul listing wajib diisi");
      return;
    }

    if (!description.trim()) {
      alert("Deskripsi wajib diisi");
      return;
    }

    const priceNumber = Number(price);

    if (!priceNumber || priceNumber <= 0) {
      alert("Harga tidak valid");
      return;
    }

    try {
      setSaving(true);

      await updateAccountListing(item.id, {
        game,
        title: title.trim(),
        description: description.trim(),
        price: priceNumber,
        rank: rank.trim() || null,
        level: level ? Number(level) : null,
        skins: skins ? Number(skins) : null,
        heroes: heroes ? Number(heroes) : null,
      });

      alert("Listing berhasil diupdate");
      router.push("/seller/accounts");
    } catch (error) {
      console.error(error);
      alert("Gagal update listing");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Memuat listing...</p>;
  }

  if (!item) {
    return (
      <section>
        <h1 className="text-2xl font-bold text-slate-950">
          Listing tidak ditemukan
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Listing ini tidak tersedia atau sudah dihapus.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Edit Listing</h1>
        <p className="mt-2 text-sm text-slate-500">
          Perbarui informasi akun game yang kamu jual.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">Game</label>
            <select
              value={game}
              onChange={(event) => setGame(event.target.value as AccountGame)}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500"
            >
              {games.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Judul Listing"
            value={title}
            onChange={setTitle}
            placeholder="Contoh: Akun ML Mythic Immortal 200 Skin"
          />

          <div>
            <label className="text-sm font-medium text-slate-700">
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Harga"
              value={price}
              onChange={setPrice}
              placeholder="750000"
              type="number"
            />

            <Input
              label="Rank"
              value={rank}
              onChange={setRank}
              placeholder="Mythic Immortal"
            />

            <Input
              label="Level"
              value={level}
              onChange={setLevel}
              placeholder="89"
              type="number"
            />

            <Input
              label="Jumlah Skin"
              value={skins}
              onChange={setSkins}
              placeholder="200"
              type="number"
            />

            <Input
              label="Jumlah Hero / Karakter"
              value={heroes}
              onChange={setHeroes}
              placeholder="120"
              type="number"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push("/seller/accounts")}
            >
              Batal
            </Button>

            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Menyimpan..." : "Update Listing"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
      />
    </div>
  );
}