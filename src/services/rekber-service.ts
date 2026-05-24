import {
  addDoc,
  collection,
  doc,
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
import { getDoc } from "firebase/firestore";
import { addBalanceToUser } from "@/services/wallet-service";

export type CreateRekberInput = {
  buyerId: string;
  sellerContact: string;
  itemName: string;
  itemDescription: string;
  amount: number;
  fee: number;
};

export async function createRekberTransaction(input: CreateRekberInput) {
  const invoice = `RKB-${Date.now()}`;

  const payload = {
    invoice,
    buyerId: input.buyerId,
    sellerId: null,
    sellerContact: input.sellerContact,
    itemName: input.itemName,
    itemDescription: input.itemDescription,
    amount: input.amount,
    fee: input.fee,
    totalAmount: input.amount + input.fee,
    status: "waiting_payment",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(
    collection(db, COLLECTIONS.REKBER),
    payload
  );

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

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as RekberTransaction[];
}

export async function getAllRekberTransactions() {
  const q = query(
    collection(db, COLLECTIONS.REKBER),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as RekberTransaction[];
}

export async function markRekberAsPaid(rekberId: string) {
  await updateDoc(doc(db, COLLECTIONS.REKBER, rekberId), {
    status: "holding_fund",
    updatedAt: serverTimestamp(),
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

  await updateDoc(rekberRef, {
    status: "completed",
    updatedAt: serverTimestamp(),
  });

  if (rekber.sellerId) {
    await addBalanceToUser({
      userId: rekber.sellerId,
      amount: rekber.amount,
      description: `Release dana rekber ${rekber.invoice}`,
      referenceId: rekber.id,
    });
  }
}
export async function assignSellerToRekber(
  rekberId: string,
  sellerId: string
) {
  await updateDoc(doc(db, COLLECTIONS.REKBER, rekberId), {
    sellerId,
    updatedAt: serverTimestamp(),
  });
}

export async function disputeRekber(rekberId: string) {
  await updateDoc(doc(db, COLLECTIONS.REKBER, rekberId), {
    status: "dispute",
    updatedAt: serverTimestamp(),
  });
}