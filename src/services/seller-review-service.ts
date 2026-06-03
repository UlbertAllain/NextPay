import {
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

export type SellerReview = {
  id: string;
  rekberId: string;
  buyerId: string;
  sellerId: string;
  rating: number;
  comment: string;
  createdAt: unknown;
};

export async function createSellerReview(input: {
  rekberId: string;
  buyerId: string;
  sellerId: string;
  rating: number;
  comment: string;
}) {
  if (input.rating < 1 || input.rating > 5) {
    throw new Error("Rating harus antara 1 sampai 5");
  }

  const existingQuery = query(
    collection(db, COLLECTIONS.SELLER_REVIEWS),
    where("rekberId", "==", input.rekberId),
    where("buyerId", "==", input.buyerId)
  );

  const existingSnapshot = await getDocs(existingQuery);

  if (!existingSnapshot.empty) {
    throw new Error("Kamu sudah memberikan review untuk transaksi ini");
  }

  const reviewRef = await addDoc(collection(db, COLLECTIONS.SELLER_REVIEWS), {
    rekberId: input.rekberId,
    buyerId: input.buyerId,
    sellerId: input.sellerId,
    rating: input.rating,
    comment: input.comment,
    createdAt: serverTimestamp(),
  });

  return reviewRef.id;
}

export async function getReviewsBySellerId(sellerId: string) {
  const q = query(
    collection(db, COLLECTIONS.SELLER_REVIEWS),
    where("sellerId", "==", sellerId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as SellerReview[];
}

export async function getReviewByRekberAndBuyer(
  rekberId: string,
  buyerId: string
) {
  const q = query(
    collection(db, COLLECTIONS.SELLER_REVIEWS),
    where("rekberId", "==", rekberId),
    where("buyerId", "==", buyerId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const document = snapshot.docs[0];

  return {
    id: document.id,
    ...document.data(),
  } as SellerReview;
}

export function calculateAverageRating(reviews: SellerReview[]) {
  if (reviews.length === 0) {
    return 0;
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);

  return total / reviews.length;
}