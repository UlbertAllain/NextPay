import {
  collection,
  getDoc,
  getDocs,
  doc,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/constants/collections";

export type PublicMlAccount = {
  id: string;
  sellerId: string;
  title: string;
  rank: string;
  skins: number;
  heroes: number;
  price: number;
  status: "draft" | "review" | "published" | "sold" | "rejected";
  verified: boolean;
};

export async function getPublishedMlAccounts() {
  const q = query(
    collection(db, COLLECTIONS.ML_ACCOUNTS),
    where("status", "==", "published"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PublicMlAccount[];
}

export async function getMlAccountById(id: string) {
  const snapshot = await getDoc(doc(db, COLLECTIONS.ML_ACCOUNTS, id));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as PublicMlAccount;
}