import {
  doc,
  updateDoc,
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/constants/collections";
import { Order, OrderType } from "@/types/order";
import { getPaymentProvider } from "@/services/payment";

export type CreateOrderInput = {
  userId: string;
  type: OrderType;
  title: string;
  amount: number;
  adminFee: number;

  gameSlug?: string;
  targetUserId?: string;
  serverId?: string;
  productCode?: string;
};

export async function getAllOrders() {
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as Order[];
}

export async function getOrdersByUserId(userId: string) {
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as Order[];
}

export async function createOrder(input: CreateOrderInput) {
  const invoice = `NPY-${Date.now()}`;

  const payload = {
    invoice,
    userId: input.userId,
    type: input.type,
    title: input.title,

    amount: input.amount,
    adminFee: input.adminFee,
    totalAmount: input.amount + input.adminFee,

    status: "pending_payment",
    paymentStatus: "unpaid",
    paymentProvider: "mock",

    gameSlug: input.gameSlug ?? null,
    targetUserId: input.targetUserId ?? null,
    serverId: input.serverId ?? null,
    productCode: input.productCode ?? null,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), payload);

  return {
    id: docRef.id,
    ...payload,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Order;
}

export async function createPaymentForOrder(order: Order) {
  const provider = getPaymentProvider();

  const payment = await provider.createPayment({
    orderId: order.id,
    invoice: order.invoice,
    amount: order.totalAmount,
  });

  await updateDoc(doc(db, COLLECTIONS.ORDERS, order.id), {
    paymentReference: payment.reference,
    paymentCheckoutUrl: payment.checkoutUrl,
    paymentExpiredAt: payment.expiredAt,
    paymentProvider: payment.provider,
    updatedAt: serverTimestamp(),
  });

  return payment;
}