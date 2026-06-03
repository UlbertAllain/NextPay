import {
  addDoc,
  collection,
  deleteDoc,
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
import { AccountGame, AccountListing } from "@/types/account-listing";
import { assertUserNotSuspended } from "@/services/user-service";

export type CreateAccountListingInput = {
  
  sellerId: string;
  game: AccountGame;
  title: string;
  description: string;
  price: number;
  rank?: string;
  level?: number;
  skins?: number;
  heroes?: number;
  images?: string[];
};



export async function createAccountListing(input: CreateAccountListingInput) {
    await assertUserNotSuspended(input.sellerId);
  const payload = {
    sellerId: input.sellerId,
    game: input.game,
    title: input.title,
    description: input.description,
    price: input.price,
    rank: input.rank ?? null,
    level: input.level ?? null,
    skins: input.skins ?? null,
    heroes: input.heroes ?? null,
    images: input.images ?? [],
    verified: false,
    status: "pending_review",
    reservedRekberId: null,
    reservedAt: null,
    soldAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(
    collection(db, COLLECTIONS.ACCOUNT_LISTINGS),
    payload
  );

  return {
    id: docRef.id,
    ...payload,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as AccountListing;
}

export async function getPublishedAccountListings() {
  const q = query(
    collection(db, COLLECTIONS.ACCOUNT_LISTINGS),
    where("status", "==", "published"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as AccountListing[];
}

export async function getSellerAccountListings(sellerId: string) {
  const q = query(
    collection(db, COLLECTIONS.ACCOUNT_LISTINGS),
    where("sellerId", "==", sellerId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as AccountListing[];
}

export async function getAllAccountListings() {
  const q = query(
    collection(db, COLLECTIONS.ACCOUNT_LISTINGS),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as AccountListing[];
} 

export async function getAccountListingById(id: string) {
  const snapshot = await getDoc(doc(db, COLLECTIONS.ACCOUNT_LISTINGS, id));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as AccountListing;
}

export async function getPublishedAccountListingById(id: string) {
  const listing = await getAccountListingById(id);

  if (!listing) {
    return null;
  }

  if (listing.status !== "published") {
    return null;
  }

  return listing;
}

export async function reserveAccountListing(id: string, rekberId: string) {
  const listingRef = doc(db, COLLECTIONS.ACCOUNT_LISTINGS, id);
  const snapshot = await getDoc(listingRef);

  if (!snapshot.exists()) {
    throw new Error("Listing akun tidak ditemukan");
  }

  const listing = {
    id: snapshot.id,
    ...snapshot.data(),
  } as AccountListing;

  if (listing.status !== "published") {
    throw new Error("Listing akun sudah tidak tersedia");
  }

  await updateDoc(listingRef, {
    status: "reserved",
    reservedRekberId: rekberId,
    reservedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function markAccountListingSold(id: string) {
  await updateDoc(doc(db, COLLECTIONS.ACCOUNT_LISTINGS, id), {
    status: "sold",
    soldAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function releaseReservedAccountListing(id: string) {
  await updateDoc(doc(db, COLLECTIONS.ACCOUNT_LISTINGS, id), {
    status: "published",
    reservedRekberId: null,
    reservedAt: null,
    updatedAt: serverTimestamp(),
  });
}

export async function hideAccountListing(id: string) {
  await updateDoc(doc(db, COLLECTIONS.ACCOUNT_LISTINGS, id), {
    status: "hidden",
    updatedAt: serverTimestamp(),
  });
}

export async function publishAccountListing(id: string) {
  await updateDoc(doc(db, COLLECTIONS.ACCOUNT_LISTINGS, id), {
    status: "published",
    updatedAt: serverTimestamp(),
  });
}

export async function rejectAccountListing(id: string) {
  await updateDoc(doc(db, COLLECTIONS.ACCOUNT_LISTINGS, id), {
    status: "rejected",
    updatedAt: serverTimestamp(),
  });
}

export async function updateAccountListing(
  id: string,
  input: Partial<{
    game: AccountGame;
    title: string;
    description: string;
    price: number;
    rank: string | null;
    level: number | null;
    skins: number | null;
    heroes: number | null;
    images: string[];
  }>
) {
  const listingRef = doc(db, COLLECTIONS.ACCOUNT_LISTINGS, id);
  const snapshot = await getDoc(listingRef);

  if (!snapshot.exists()) {
    throw new Error("Listing tidak ditemukan");
  }

  const listing = {
    id: snapshot.id,
    ...snapshot.data(),
  } as AccountListing;

  if (listing.status === "reserved" || listing.status === "sold") {
    throw new Error("Listing yang sudah masuk transaksi tidak bisa diedit");
  }

  await updateDoc(listingRef, {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAccountListing(id: string) {
  const listingRef = doc(db, COLLECTIONS.ACCOUNT_LISTINGS, id);
  const snapshot = await getDoc(listingRef);

  if (!snapshot.exists()) {
    throw new Error("Listing tidak ditemukan");
  }

  const listing = {
    id: snapshot.id,
    ...snapshot.data(),
  } as AccountListing;

  if (listing.status === "reserved" || listing.status === "sold") {
    throw new Error("Listing yang sudah masuk transaksi tidak bisa dihapus");
  }

  await deleteDoc(listingRef);
}