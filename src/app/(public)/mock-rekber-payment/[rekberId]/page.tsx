"use client";

import { useParams, useRouter } from "next/navigation";

import { markRekberAsPaid } from "@/services/rekber-service";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MockRekberPaymentPage() {
  const router = useRouter();
  const params = useParams<{ rekberId: string }>();

  async function simulateSuccessPayment() {
    try {
      await markRekberAsPaid(params.rekberId);
      router.push("/dashboard/rekber");
    } catch (error) {
      console.error(error);
      alert("Gagal update payment rekber");
    }
  }

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

          <div className="rounded-2xl bg-slate-50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              <span className="font-medium text-orange-600">
                Waiting Payment
              </span>
            </div>
          </div>

          <Button
            onClick={simulateSuccessPayment}
            className="mt-6 h-11 w-full"
          >
            Simulasikan Dana Masuk
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}