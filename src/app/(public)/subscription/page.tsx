"use client";

import { useEffect, useState } from "react";

import {
  getActiveSubscriptionProducts,
  PublicProduct,
} from "@/services/product-service";

import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import {
  createOrder,
  createPaymentForOrder,
} from "@/services/order-service";

export default function SubscriptionPage() {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { firebaseUser } = useAuth();
  async function handleBuy(item: PublicProduct) {
  if (!firebaseUser) {
    router.push("/login");
    return;
  }

  try {
    const order = await createOrder({
  userId: firebaseUser.uid,
  type: "subscription",
  title: item.name,
  amount: item.sellPrice,
  adminFee: 0,
});

const payment = await createPaymentForOrder(order);

router.push(payment.checkoutUrl);
  } catch (error) {
    console.error(error);
    alert("Gagal membuat order");
  }
}
  
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getActiveSubscriptionProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-950">
          Subscription Digital
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Beli layanan digital seperti Canva Pro, Spotify Premium, CapCut Pro,
          dan produk subscription lainnya.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Memuat produk subscription...</p>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-slate-500">
            Belum ada produk subscription aktif.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {products.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-5">
                <div className="mb-5 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-slate-100" />

                <h2 className="text-lg font-semibold text-slate-950">
                  {item.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {item.provider === "manual" ? "Diproses manual" : "Otomatis"}
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Produk subscription digital dengan proses order melalui
                  NextPay.
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <p className="text-xl font-bold text-slate-950">
                    {formatRupiah(item.sellPrice)}
                  </p>
                  <Button onClick={() => handleBuy(item)}>Beli</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}