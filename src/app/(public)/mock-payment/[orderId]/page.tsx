"use client";

import { useRouter, useParams } from "next/navigation";

import {
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { fulfillTopupOrder } from "@/services/fulfillment-service";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MockPaymentPage() {
  const router = useRouter();

  const params = useParams<{
    orderId: string;
  }>();

  async function simulateSuccessPayment() {
    try {
      await updateDoc(doc(db, "orders", params.orderId), {
        paymentStatus: "paid",
        status: "processing",
        updatedAt: serverTimestamp(),
      });

      await fulfillTopupOrder(params.orderId);

      router.push(`/dashboard/orders/${params.orderId}`);
    } catch (error) {
      console.error(error);
      alert("Gagal update payment atau fulfillment");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-950">
              Mock Payment Gateway
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Simulasi payment Tripay untuk development.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Provider</span>
              <span className="font-medium">Mock Tripay</span>
            </div>

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
            Simulasikan Payment Success
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}