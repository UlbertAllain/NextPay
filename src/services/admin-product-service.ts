import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/constants/collections";
import { Product } from "@/types/product";

export type CreateProductInput = {
  category: "game" | "subscription";
  name: string;
  slug: string;
  provider: "digiflazz" | "manual";
  providerCode?: string;
  basePrice: number;
  sellPrice: number;
  status: "active" | "inactive" | "maintenance";
};

export async function getAllProducts() {
  const q = query(
    collection(db, COLLECTIONS.PRODUCTS),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
}

export async function createProduct(input: CreateProductInput) {
  const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}