import {
  addDoc,
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
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/constants/collections";

export type WithdrawalStatus = "pending" | "approved" | "rejected";

export type WithdrawalRequest = {
  id: string;
  userId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  status: WithdrawalStatus;
  note?: string | null;
  createdAt: unknown;
  updatedAt: unknown;
  approvedAt?: unknown;
  rejectedAt?: unknown;
};

export async function createWithdrawalRequest(input: {
  userId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
}) {
  if (input.amount <= 0) {
    throw new Error("Nominal withdrawal tidak valid");
  }

  const userRef = doc(db, COLLECTIONS.USERS, input.userId);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    throw new Error("User tidak ditemukan");
  }

  const userData = userSnapshot.data();
  const balance = userData.balance ?? 0;

  if (balance < input.amount) {
    throw new Error("Saldo tidak mencukupi");
  }

  await updateDoc(userRef, {
    balance: increment(-input.amount),
    updatedAt: serverTimestamp(),
  });

  const withdrawalRef = await addDoc(collection(db, COLLECTIONS.WITHDRAWALS), {
    userId: input.userId,
    amount: input.amount,
    bankName: input.bankName,
    accountNumber: input.accountNumber,
    accountHolderName: input.accountHolderName,
    status: "pending",
    note: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, "wallet_transactions"), {
    userId: input.userId,
    type: "withdrawal",
    amount: -input.amount,
    description: "Pengajuan withdrawal saldo",
    referenceId: withdrawalRef.id,
    createdAt: serverTimestamp(),
  });

  return withdrawalRef.id;
}

export async function getWithdrawalsByUserId(userId: string) {
  const q = query(
    collection(db, COLLECTIONS.WITHDRAWALS),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as WithdrawalRequest[];
}

export async function getAllWithdrawals() {
  const q = query(
    collection(db, COLLECTIONS.WITHDRAWALS),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as WithdrawalRequest[];
}

export async function approveWithdrawal(withdrawalId: string) {
  const withdrawalRef = doc(db, COLLECTIONS.WITHDRAWALS, withdrawalId);
  const snapshot = await getDoc(withdrawalRef);

  if (!snapshot.exists()) {
    throw new Error("Withdrawal tidak ditemukan");
  }

  const withdrawal = snapshot.data() as WithdrawalRequest;

  if (withdrawal.status !== "pending") {
    throw new Error("Withdrawal sudah diproses");
  }

  await updateDoc(withdrawalRef, {
    status: "approved",
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function rejectWithdrawal(withdrawalId: string, note?: string) {
  const withdrawalRef = doc(db, COLLECTIONS.WITHDRAWALS, withdrawalId);
  const snapshot = await getDoc(withdrawalRef);

  if (!snapshot.exists()) {
    throw new Error("Withdrawal tidak ditemukan");
  }

  const withdrawal = {
    id: snapshot.id,
    ...snapshot.data(),
  } as WithdrawalRequest;

  if (withdrawal.status !== "pending") {
    throw new Error("Withdrawal sudah diproses");
  }

  await updateDoc(doc(db, COLLECTIONS.USERS, withdrawal.userId), {
    balance: increment(withdrawal.amount),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(withdrawalRef, {
    status: "rejected",
    note: note ?? "Withdrawal ditolak admin",
    rejectedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, "wallet_transactions"), {
    userId: withdrawal.userId,
    type: "adjustment",
    amount: withdrawal.amount,
    description: "Refund saldo withdrawal ditolak",
    referenceId: withdrawal.id,
    createdAt: serverTimestamp(),
  });
}