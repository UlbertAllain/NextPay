"use client";

import { useEffect, useState } from "react";

import {
  createProduct,
  getAllProducts,
} from "@/services/admin-product-service";

import { Product } from "@/types/product";
import { formatRupiah } from "@/lib/format";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState<"game" | "subscription">("game");
  const [provider, setProvider] = useState<"digiflazz" | "manual">("manual");
  const [providerCode, setProviderCode] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil produk");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleCreateProduct() {
    if (!name || !slug || !basePrice || !sellPrice) {
      alert("Nama, slug, base price, dan sell price wajib diisi");
      return;
    }

    try {
      await createProduct({
        name,
        slug,
        category,
        provider,
        providerCode: providerCode || undefined,
        basePrice: Number(basePrice),
        sellPrice: Number(sellPrice),
        status: "active",
      });

      setName("");
      setSlug("");
      setProviderCode("");
      setBasePrice("");
      setSellPrice("");

      await loadProducts();
    } catch (error) {
      console.error(error);
      alert("Gagal membuat produk");
    }
  }

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Produk</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input label="Nama Produk" value={name} onChange={setName} />
          <Input label="Slug" value={slug} onChange={setSlug} />
          <Input
            label="Kode Provider"
            value={providerCode}
            onChange={setProviderCode}
          />

          <div>
            <label className="text-sm font-medium text-slate-700">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as "game" | "subscription")
              }
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none"
            >
              <option value="game">Game</option>
              <option value="subscription">Subscription</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) =>
                setProvider(e.target.value as "digiflazz" | "manual")
              }
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none"
            >
              <option value="manual">Manual</option>
              <option value="digiflazz">Digiflazz</option>
            </select>
          </div>

          <Input label="Base Price" value={basePrice} onChange={setBasePrice} />
          <Input label="Sell Price" value={sellPrice} onChange={setSellPrice} />

          <div className="flex items-end">
            <Button onClick={handleCreateProduct} className="h-11 w-full">
              Simpan Produk
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Memuat produk...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada produk.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-3 pr-4 font-medium">Produk</th>
                    <th className="py-3 pr-4 font-medium">Kategori</th>
                    <th className="py-3 pr-4 font-medium">Provider</th>
                    <th className="py-3 pr-4 font-medium">Kode</th>
                    <th className="py-3 pr-4 font-medium">Base</th>
                    <th className="py-3 pr-4 font-medium">Jual</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-slate-100"
                    >
                      <td className="py-4 pr-4">
                        <p className="font-medium text-slate-950">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {product.slug}
                        </p>
                      </td>
                      <td className="py-4 pr-4 capitalize">
                        {product.category}
                      </td>
                      <td className="py-4 pr-4 capitalize">
                        {product.provider}
                      </td>
                      <td className="py-4 pr-4">
                        {product.providerCode || "-"}
                      </td>
                      <td className="py-4 pr-4">
                        {formatRupiah(product.basePrice)}
                      </td>
                      <td className="py-4 pr-4 font-semibold">
                        {formatRupiah(product.sellPrice)}
                      </td>
                      <td className="py-4 pr-4 capitalize">
                        {product.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
      />
    </div>
  );
}