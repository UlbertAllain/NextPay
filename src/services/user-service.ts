import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/constants/collections";
import { AppUser } from "@/types/user";

export type UserWithId = AppUser & {
  id: string;
};

export async function getSellers() {
  const q = query(
    collection(db, COLLECTIONS.USERS),
    where("role", "==", "seller"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as UserWithId[];
}