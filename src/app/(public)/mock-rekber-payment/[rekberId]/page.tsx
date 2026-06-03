"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import {
  cancelExpiredRekberTransaction,
  markRekberAsPaid,
} from "@/services/rekber-service";
import { RekberTransaction } from "@/types/rekber";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function parseFirestoreDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }

  return null;
}

function isRekberExpired(expiredAt: unknown) {
  const parsedExpiredAt = parseFirestoreDate(expiredAt);

  if (!parsedExpiredAt) {
    return false;
  }

  return parsedExpiredAt.getTime() < Date.now();
}

function getStatusText(rekber: RekberTransaction | null, expired: boolean) {
  if (!rekber) return "-";

  if (expired && rekber.status === "waiting_payment") {
    return "Expired";
  }

  return formatStatus(rekber.status);
}

function getStatusClass(rekber: RekberTransaction | null, expired: boolean) {
  if (!rekber) return "text-slate-600";

  if (expired && rekber.status === "waiting_payment") {
    return "text-red-600";
  }

  switch (rekber.status) {
    case "waiting_payment":
      return "text-orange-600";
    case "holding_fund":
      return "text-blue-600";
    case "completed":
      return "text-green-600";
    case "cancelled":
    case "refunded":
      return "text-red-600";
    default:
      return "text-slate-600";
  }
}

export default function MockRekberPaymentPage() {
  const router = useRouter();
  const params = useParams<{ rekberId: string }>();

  const [rekber, setRekber] = useState<RekberTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [expired, setExpired] = useState(false);

  async function loadData() {
    try {
      setLoading(true);

      const snapshot = await getDoc(doc(db, "rekber_transactions", params.rekberId));

      if (!snapshot.exists()) {
        setRekber(null);
        setExpired(false);
        return;
      }

      const data = {
        id: snapshot.id,
        ...snapshot.data(),
      } as RekberTransaction;

      const currentExpired = isRekberExpired(data.expiredAt);

      if (currentExpired && data.status === "waiting_payment") {
        await cancelExpiredRekberTransaction(data.id);

        const latestSnapshot = await getDoc(
          doc(db, "rekber_transactions", params.rekberId)
        );

        if (latestSnapshot.exists()) {
          const latestData = {
            id: latestSnapshot.id,
            ...latestSnapshot.data(),
          } as RekberTransaction;

          setRekber(latestData);
          setExpired(true);
          return;
        }
      }

      setRekber(data);
      setExpired(currentExpired);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data pembayaran rekber");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [params.rekberId]);

  async function simulateSuccessPayment() {
    if (!rekber) return;

    if (rekber.status !== "waiting_payment") {
      alert("Transaksi ini sudah tidak bisa dibayar");
      return;
    }

    if (isRekberExpired(rekber.expiredAt)) {
      try {
        setPayLoading(true);

        await cancelExpiredRekberTransaction(rekber.id);
        await loadData();

        alert("Pembayaran sudah melewati batas waktu");
      } catch (error) {
        console.error(error);
        alert("Gagal membatalkan transaksi expired");
      } finally {
        setPayLoading(false);
      }

      return;
    }

    try {
      setPayLoading(true);

      await markRekberAsPaid(params.rekberId);

      router.push("/dashboard/rekber");
    } catch (error) {
      console.error(error);
      alert("Gagal update payment rekber");
    } finally {
      setPayLoading(false);
    }
  }

  const canPay =
    !loading &&
    !payLoading &&
    rekber?.status === "waiting_payment" &&
    !expired;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-950">
              Mock Rekber Payment
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Simulasi pembayaran dana rekber untuk development.
            </p>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">
              Memuat data pembayaran...
            </p>
          ) : !rekber ? (
            <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              Transaksi rekber tidak ditemukan.
            </div>
          ) : (
            <>
              <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Invoice</span>
                  <span className="text-right font-medium text-slate-950">
                    {rekber.invoice}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Item</span>
                  <span className="text-right font-medium text-slate-950">
                    {rekber.itemName}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Total Bayar</span>
                  <span className="text-right font-bold text-slate-950">
                    {formatRupiah(rekber.totalAmount)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Status</span>
                  <span
                    className={`text-right font-medium capitalize ${getStatusClass(
                      rekber,
                      expired
                    )}`}
                  >
                    {getStatusText(rekber, expired)}
                  </span>
                </div>
              </div>

              {expired && rekber.status === "cancelled" && (
                <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  Transaksi ini sudah expired dan dibatalkan. Akun sudah
                  dikembalikan menjadi tersedia.
                </p>
              )}

              {expired && rekber.status === "waiting_payment" && (
                <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  Batas waktu pembayaran sudah lewat.
                </p>
              )}

              {rekber.status !== "waiting_payment" && (
                <p className="mt-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-600">
                  Transaksi ini sudah tidak berada pada status menunggu
                  pembayaran.
                </p>
              )}

              <Button
                onClick={simulateSuccessPayment}
                className="mt-6 h-11 w-full"
                disabled={!canPay}
              >
                {payLoading ? "Memproses..." : "Simulasikan Dana Masuk"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}