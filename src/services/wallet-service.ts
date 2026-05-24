import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  addDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";

export async function addBalanceToUser({
  userId,
  amount,
  description,
  referenceId,
}: {
  userId: string;
  amount: number;
  description: string;
  referenceId?: string;
}) {
  const userRef = doc(db, "users", userId);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    throw new Error("User seller tidak ditemukan");
  }

  await updateDoc(userRef, {
    balance: increment(amount),
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, "wallet_transactions"), {
    userId,
    type: "rekber_release",
    amount,
    description,
    referenceId: referenceId || null,
    createdAt: serverTimestamp(),
  });
}

export async function getWalletTransactionsByUserId(userId: string) {
  const q = query(
    collection(db, "wallet_transactions"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}