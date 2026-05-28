import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/constants/collections";
import { RekberTransaction } from "@/types/rekber";
import { addBalanceToUser } from "@/services/wallet-service";
import { createNotification } from "@/services/notification-service";
import {
  markAccountListingSold,
  releaseReservedAccountListing,
  reserveAccountListing,
} from "@/services/account-listing-service";

export type CreateRekberInput = {
  buyerId: string;
  sellerId?: string | null;
  sellerContact: string;
  itemName: string;
  itemDescription: string;
  amount: number;
  fee: number;
  sourceType?: "manual" | "account_listing";
  sourceId?: string | null;
};

function getRekberExpiredAt() {
  const expiredAt = new Date();
  expiredAt.setMinutes(expiredAt.getMinutes() + 30);
  return expiredAt;
}

export async function createRekberTransaction(input: CreateRekberInput) {
  const invoice = `RKB-${Date.now()}`;

  const payload = {
    invoice,
    buyerId: input.buyerId,
    sellerId: input.sellerId ?? null,
    sellerContact: input.sellerContact,
    itemName: input.itemName,
    itemDescription: input.itemDescription,
    amount: input.amount,
    fee: input.fee,
    totalAmount: input.amount + input.fee,
    sourceType: input.sourceType ?? "manual",
    sourceId: input.sourceId ?? null,
    status: "waiting_payment",
    paymentStatus: "unpaid",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    expiredAt: getRekberExpiredAt(),
cancelledAt: null,
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.REKBER), payload);

  if (payload.sourceType === "account_listing" && payload.sourceId) {
    await reserveAccountListing(payload.sourceId, docRef.id);
  }

  return {
    id: docRef.id,
    ...payload,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as RekberTransaction;
}

export async function getRekberByBuyerId(buyerId: string) {
  const q = query(
    collection(db, COLLECTIONS.REKBER),
    where("buyerId", "==", buyerId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as RekberTransaction[];
}

export async function getRekberBySellerId(sellerId: string) {
  const q = query(
    collection(db, COLLECTIONS.REKBER),
    where("sellerId", "==", sellerId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as RekberTransaction[];
}

export async function getAllRekberTransactions() {
  const q = query(
    collection(db, COLLECTIONS.REKBER),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as RekberTransaction[];
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

export async function markRekberAsPaid(rekberId: string) {
  const rekberRef = doc(db, COLLECTIONS.REKBER, rekberId);
  const snapshot = await getDoc(rekberRef);

  if (!snapshot.exists()) {
    throw new Error("Transaksi rekber tidak ditemukan");
  }

  const rekber = {
    id: snapshot.id,
    ...snapshot.data(),
  } as RekberTransaction;

  if (rekber.status !== "waiting_payment") {
    throw new Error("Rekber tidak berada di status waiting_payment");
  }

  const expiredAt = parseFirestoreDate(rekber.expiredAt);
if (expiredAt && expiredAt.getTime() < Date.now()) {
  await cancelExpiredRekberTransaction(rekberId);
  throw new Error("Pembayaran sudah melewati batas waktu");
}
  
  await updateDoc(rekberRef, {
    status: "holding_fund",
    paymentStatus: "paid",
    paidAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await createNotification({
    userId: rekber.buyerId,
    title: "Pembayaran Rekber Berhasil",
    message: `Dana untuk ${rekber.itemName} sudah ditahan oleh NextPay.`,
    type: "rekber",
  });

  if (rekber.sellerId) {
    await createNotification({
      userId: rekber.sellerId,
      title: "Rekber Baru Dibayar",
      message: `Buyer sudah membayar ${rekber.itemName}. Silakan kirim item.`,
      type: "rekber",
    });
  }
}

export async function cancelExpiredRekberTransaction(rekberId: string) {
  const rekberRef = doc(db, COLLECTIONS.REKBER, rekberId);
  const snapshot = await getDoc(rekberRef);

  if (!snapshot.exists()) {
    throw new Error("Transaksi rekber tidak ditemukan");
  }

  const rekber = {
    id: snapshot.id,
    ...snapshot.data(),
  } as RekberTransaction;

  if (rekber.status !== "waiting_payment") {
    throw new Error("Hanya rekber waiting_payment yang bisa dibatalkan");
  }

  await updateDoc(rekberRef, {
    status: "cancelled",
    paymentStatus: "expired",
    cancelledAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (rekber.sourceType === "account_listing" && rekber.sourceId) {
    await releaseReservedAccountListing(rekber.sourceId);
  }

  await createNotification({
    userId: rekber.buyerId,
    title: "Rekber Dibatalkan",
    message: `Transaksi ${rekber.itemName} dibatalkan karena pembayaran melewati batas waktu.`,
    type: "rekber",
  });

  if (rekber.sellerId) {
    await createNotification({
      userId: rekber.sellerId,
      title: "Rekber Dibatalkan",
      message: `Transaksi ${rekber.itemName} dibatalkan karena buyer tidak menyelesaikan pembayaran.`,
      type: "rekber",
    });
  }
}

export async function assignSellerToRekber(
  rekberId: string,
  sellerId: string
) {
  const rekberRef = doc(db, COLLECTIONS.REKBER, rekberId);
  const snapshot = await getDoc(rekberRef);

  if (!snapshot.exists()) {
    throw new Error("Transaksi rekber tidak ditemukan");
  }

  const rekber = {
    id: snapshot.id,
    ...snapshot.data(),
  } as RekberTransaction;

  if (rekber.sourceType === "account_listing") {
    throw new Error("Marketplace internal tidak membutuhkan assign seller manual");
  }

  await updateDoc(rekberRef, {
    sellerId,
    updatedAt: serverTimestamp(),
  });

  await createNotification({
    userId: sellerId,
    title: "Kamu Ditugaskan ke Rekber",
    message: `Admin menugaskan kamu sebagai seller untuk ${rekber.itemName}.`,
    type: "rekber",
  });
}

export async function markRekberDelivered(rekberId: string) {
  const rekberRef = doc(db, COLLECTIONS.REKBER, rekberId);
  const snapshot = await getDoc(rekberRef);

  if (!snapshot.exists()) {
    throw new Error("Transaksi rekber tidak ditemukan");
  }

  const rekber = {
    id: snapshot.id,
    ...snapshot.data(),
  } as RekberTransaction;

  if (rekber.status !== "holding_fund") {
    throw new Error("Rekber belum bisa ditandai dikirim");
  }

  if (!rekber.sellerId) {
    throw new Error("Seller tidak ditemukan pada transaksi ini");
  }

  await updateDoc(rekberRef, {
    status: "waiting_confirmation",
    deliveredAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await createNotification({
    userId: rekber.buyerId,
    title: "Seller Sudah Mengirim Item",
    message: `${rekber.itemName} sudah ditandai dikirim oleh seller. Silakan cek dan konfirmasi.`,
    type: "rekber",
  });
}

export async function confirmRekberCompleted(rekberId: string) {
  const rekberRef = doc(db, COLLECTIONS.REKBER, rekberId);
  const snapshot = await getDoc(rekberRef);

  if (!snapshot.exists()) {
    throw new Error("Transaksi rekber tidak ditemukan");
  }

  const rekber = {
    id: snapshot.id,
    ...snapshot.data(),
  } as RekberTransaction;

  if (rekber.status === "completed") {
    return;
  }

  if (rekber.status !== "waiting_confirmation") {
    throw new Error("Rekber belum bisa dikonfirmasi selesai");
  }

  if (!rekber.sellerId) {
    throw new Error("Seller tidak ditemukan pada transaksi ini");
  }

  await updateDoc(rekberRef, {
    status: "completed",
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addBalanceToUser({
    userId: rekber.sellerId,
    amount: rekber.amount,
    description: `Release dana rekber ${rekber.invoice}`,
    referenceId: rekber.id,
  });

  if (rekber.sourceType === "account_listing" && rekber.sourceId) {
    await markAccountListingSold(rekber.sourceId);
  }

  await createNotification({
    userId: rekber.sellerId,
    title: "Dana Rekber Masuk",
    message: `Dana ${rekber.itemName} sudah masuk ke wallet.`,
    type: "rekber",
  });

  await createNotification({
    userId: rekber.buyerId,
    title: "Rekber Selesai",
    message: `Transaksi ${rekber.itemName} sudah selesai.`,
    type: "rekber",
  });
}

export async function releaseDisputedRekberToSeller(rekberId: string) {
  const rekberRef = doc(db, COLLECTIONS.REKBER, rekberId);
  const snapshot = await getDoc(rekberRef);

  if (!snapshot.exists()) {
    throw new Error("Transaksi rekber tidak ditemukan");
  }

  const rekber = {
    id: snapshot.id,
    ...snapshot.data(),
  } as RekberTransaction;

  if (rekber.status !== "dispute") {
    throw new Error("Manual release hanya bisa dilakukan saat status dispute");
  }

  if (!rekber.sellerId) {
    throw new Error("Seller tidak ditemukan pada transaksi ini");
  }

  await updateDoc(rekberRef, {
    status: "completed",
    completedAt: serverTimestamp(),
    releasedByAdminAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addBalanceToUser({
    userId: rekber.sellerId,
    amount: rekber.amount,
    description: `Manual release dana rekber ${rekber.invoice}`,
    referenceId: rekber.id,
  });

  if (rekber.sourceType === "account_listing" && rekber.sourceId) {
    await markAccountListingSold(rekber.sourceId);
  }

  await createNotification({
    userId: rekber.sellerId,
    title: "Dana Rekber Dirilis Admin",
    message: `Dana ${rekber.itemName} sudah dirilis ke wallet kamu oleh admin.`,
    type: "rekber",
  });

  await createNotification({
    userId: rekber.buyerId,
    title: "Dispute Rekber Selesai",
    message: `Transaksi ${rekber.itemName} diselesaikan oleh admin.`,
    type: "rekber",
  });
}

export async function refundRekberToBuyer(rekberId: string) {
  const rekberRef = doc(db, COLLECTIONS.REKBER, rekberId);
  const snapshot = await getDoc(rekberRef);

  if (!snapshot.exists()) {
    throw new Error("Transaksi rekber tidak ditemukan");
  }

  const rekber = {
    id: snapshot.id,
    ...snapshot.data(),
  } as RekberTransaction;

  if (rekber.status !== "dispute") {
    throw new Error("Refund hanya bisa dilakukan saat status dispute");
  }

  await updateDoc(rekberRef, {
    status: "refunded",
    paymentStatus: "refunded",
    refundedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addBalanceToUser({
    userId: rekber.buyerId,
    amount: rekber.totalAmount,
    description: `Refund dana rekber ${rekber.invoice}`,
    referenceId: rekber.id,
  });

  if (rekber.sourceType === "account_listing" && rekber.sourceId) {
    await releaseReservedAccountListing(rekber.sourceId);
  }

  await createNotification({
    userId: rekber.buyerId,
    title: "Dana Rekber Dikembalikan",
    message: `Dana untuk transaksi ${rekber.itemName} sudah dikembalikan ke wallet.`,
    type: "rekber",
  });

  if (rekber.sellerId) {
    await createNotification({
      userId: rekber.sellerId,
      title: "Rekber Direfund",
      message: `Transaksi ${rekber.itemName} direfund ke buyer oleh admin.`,
      type: "rekber",
    });
  }
}

export async function disputeRekber(rekberId: string) {
  const rekberRef = doc(db, COLLECTIONS.REKBER, rekberId);
  const snapshot = await getDoc(rekberRef);

  if (!snapshot.exists()) {
    throw new Error("Transaksi rekber tidak ditemukan");
  }

  const rekber = {
    id: snapshot.id,
    ...snapshot.data(),
  } as RekberTransaction;

  if (
    rekber.status !== "holding_fund" &&
    rekber.status !== "waiting_confirmation"
  ) {
    throw new Error("Rekber belum bisa dispute");
  }

  await updateDoc(rekberRef, {
    status: "dispute",
    disputedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await createNotification({
    userId: rekber.buyerId,
    title: "Rekber Masuk Dispute",
    message: `Transaksi ${rekber.itemName} sedang menunggu keputusan admin.`,
    type: "rekber",
  });

  if (rekber.sellerId) {
    await createNotification({
      userId: rekber.sellerId,
      title: "Rekber Masuk Dispute",
      message: `Transaksi ${rekber.itemName} sedang dalam dispute.`,
      type: "rekber",
    });
  }
}