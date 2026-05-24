import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/constants/collections";

export type PublicProduct = {
  id: string;
  category: "game" | "subscription";
  name: string;
  slug: string;
  provider: "digiflazz" | "manual";
  providerCode?: string;
  basePrice: number;
  sellPrice: number;
  status: "active" | "inactive" | "maintenance";
};

export async function getActiveGameProducts() {
  const q = query(
    collection(db, COLLECTIONS.PRODUCTS),
    where("category", "==", "game"),
    where("status", "==", "active"),
    orderBy("name", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PublicProduct[];
}

export async function getActiveSubscriptionProducts() {
  const q = query(
    collection(db, COLLECTIONS.PRODUCTS),
    where("category", "==", "subscription"),
    where("status", "==", "active"),
    orderBy("name", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PublicProduct[];
}