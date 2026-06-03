import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/constants/collections";
import { RekberTransaction } from "@/types/rekber";
import { addBalanceToUser } from "@/services/wallet-service";
import { createNotification } from "@/services/notification-service";
import { uploadImageToCloudinary } from "@/services/cloudinary-service";
import { assertUserNotSuspended } from "@/services/user-service";
import {
  markAccountListingSold,
  releaseReservedAccountListing,
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

function parseFirestoreDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) return value;

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

export async function createRekberTransaction(input: CreateRekberInput) {
  const invoice = `RKB-${Date.now()}`;
  const rekberRef = doc(collection(db, COLLECTIONS.REKBER));

  if (input.buyerId === input.sellerId) {
    throw new Error("Buyer tidak bisa membeli akun milik sendiri");
  }

  await assertUserNotSuspended(input.buyerId);

  return await runTransaction(db, async (transaction) => {
    let listingRef = null;

    if (input.sourceType === "account_listing" && input.sourceId) {
      listingRef = doc(db, COLLECTIONS.ACCOUNT_LISTINGS, input.sourceId);

      const listingSnapshot = await transaction.get(listingRef);

      if (!listingSnapshot.exists()) {
        throw new Error("Akun tidak ditemukan");
      }

      const listingData = listingSnapshot.data();

      if (listingData.sellerId === input.buyerId) {
        throw new Error("Buyer tidak bisa membeli akun milik sendiri");
      }

      if (listingData.status !== "published") {
        throw new Error("Akun sudah tidak tersedia");
      }

      if (listingData.sellerId !== input.sellerId) {
        throw new Error("Penjual akun tidak sesuai");
      }
    }

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

      paymentProofUrl: null,
      paymentProofPublicId: null,
      paymentProofUploadedAt: null,

      paymentVerifiedBy: null,
      paymentVerifiedAt: null,

      paymentRejectedReason: null,
      paymentRejectedAt: null,

      paidAt: null,
      expiredAt: getRekberExpiredAt(),
      cancelledAt: null,
      deliveredAt: null,
      completedAt: null,
      disputedAt: null,
      refundedAt: null,
      releasedByAdminAt: null,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    transaction.set(rekberRef, payload);

    if (listingRef) {
      transaction.update(listingRef, {
        status: "reserved",
        reservedRekberId: rekberRef.id,
        reservedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return {
      id: rekberRef.id,
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as RekberTransaction;
  });
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

export async function uploadRekberPaymentProof(
  rekberId: string,
  buyerId: string,
  file: File
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

  if (rekber.buyerId !== buyerId) {
    throw new Error("Anda tidak memiliki akses ke transaksi ini");
  }

  await assertUserNotSuspended(buyerId);

  if (rekber.status !== "waiting_payment") {
    throw new Error("Bukti pembayaran hanya bisa diupload saat menunggu pembayaran");
  }

  if (
    rekber.paymentStatus !== "unpaid" &&
    rekber.paymentStatus !== "rejected"
  ) {
    throw new Error("Status pembayaran tidak bisa menerima bukti baru");
  }

  const expiredAt = parseFirestoreDate(rekber.expiredAt);

  if (expiredAt && expiredAt.getTime() < Date.now()) {
    await cancelExpiredRekberTransaction(rekberId);
    throw new Error("Pembayaran sudah melewati batas waktu");
  }

  const uploaded = await uploadImageToCloudinary(file);

  await updateDoc(rekberRef, {
    paymentStatus: "waiting_verification",
    paymentProofUrl: uploaded.url,
    paymentProofPublicId: uploaded.publicId,
    paymentProofUploadedAt: serverTimestamp(),
    paymentRejectedReason: null,
    paymentRejectedAt: null,
    updatedAt: serverTimestamp(),
  });

  await createNotification({
    userId: buyerId,
    title: "Bukti Pembayaran Diupload",
    message: `Bukti pembayaran untuk ${rekber.itemName} sedang menunggu verifikasi admin.`,
    type: "rekber",
  });

  return uploaded;
}

export async function approveRekberPaymentProof(
  rekberId: string,
  adminId: string
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

  if (rekber.status !== "waiting_payment") {
    throw new Error("Rekber tidak berada di status waiting_payment");
  }

  if (rekber.paymentStatus !== "waiting_verification") {
    throw new Error("Pembayaran belum menunggu verifikasi admin");
  }

  if (!rekber.paymentProofUrl) {
    throw new Error("Bukti pembayaran belum tersedia");
  }

  await updateDoc(rekberRef, {
    status: "holding_fund",
    paymentStatus: "paid",
    paymentVerifiedBy: adminId,
    paymentVerifiedAt: serverTimestamp(),
    paidAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await createNotification({
    userId: rekber.buyerId,
    title: "Pembayaran Diverifikasi",
    message: `Pembayaran untuk ${rekber.itemName} sudah disetujui admin.`,
    type: "rekber",
  });

  if (rekber.sellerId) {
    await createNotification({
      userId: rekber.sellerId,
      title: "Rekber Baru Dibayar",
      message: `Buyer sudah membayar ${rekber.itemName}. Silakan kirim akun.`,
      type: "rekber",
    });
  }
}

export async function rejectRekberPaymentProof(
  rekberId: string,
  reason: string
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

  if (rekber.status !== "waiting_payment") {
    throw new Error("Rekber tidak berada di status waiting_payment");
  }

  if (rekber.paymentStatus !== "waiting_verification") {
    throw new Error("Pembayaran belum menunggu verifikasi admin");
  }

  if (!reason.trim()) {
    throw new Error("Alasan penolakan wajib diisi");
  }

  await updateDoc(rekberRef, {
    paymentStatus: "rejected",
    paymentRejectedReason: reason.trim(),
    paymentRejectedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await createNotification({
    userId: rekber.buyerId,
    title: "Bukti Pembayaran Ditolak",
    message: `Bukti pembayaran untuk ${rekber.itemName} ditolak. Alasan: ${reason.trim()}`,
    type: "rekber",
  });
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
      message: `Buyer sudah membayar ${rekber.itemName}. Silakan kirim akun.`,
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

  if (rekber.status === "completed") return;

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