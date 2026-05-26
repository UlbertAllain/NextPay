import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { createAuditLog } from "@/services/audit-log-service";
import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/constants/collections";
import { Order } from "@/types/order";
import { getGameProvider } from "@/services/game-provider";
import { createNotification } from "@/services/notification-service";

export async function fulfillTopupOrder(orderId: string) {
  const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
  const snapshot = await getDoc(orderRef);

  if (!snapshot.exists()) {
    throw new Error("Order tidak ditemukan");
  }

  const order = {
    id: snapshot.id,
    ...snapshot.data(),
  } as Order;

  if (order.type !== "topup") {
    throw new Error("Order bukan topup");
  }

  if (order.paymentStatus !== "paid") {
    throw new Error("Payment belum paid");
  }

  if (!order.productCode) {
    throw new Error("Product code order belum tersedia");
  }

  if (!order.targetUserId) {
    throw new Error("Target User ID belum tersedia");
  }

  if (order.status === "success") {
    return {
      status: "success",
      message: "Order sudah sukses",
    };
  }

  const provider = getGameProvider();

  const result = await provider.createTopup({
    orderId: order.id,
    userId: order.targetUserId,
    serverId: order.serverId,
    productCode: order.productCode,
  });

  await updateDoc(orderRef, {
    status: result.status,
    providerReference: result.reference,
    fulfilledBy: result.provider,
    fulfilledAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await createAuditLog({
    action: "TOPUP_FULFILLED",
    targetCollection: "orders",
    targetId: order.id,
    metadata: {
      providerReference: result.reference,
      provider: result.provider,
      productCode: order.productCode,
      targetUserId: order.targetUserId,
      serverId: order.serverId ?? null,
    },
  });

  await createNotification({
    userId: order.userId,
    title: "Topup Berhasil",
    message: `${order.title} berhasil diproses.`,
    type: "topup",
  });

  return result;
}