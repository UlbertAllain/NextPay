import {
  collection,
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

export type UserRole = "user" | "seller" | "admin" | "super_admin";
export type UserStatus = "active" | "suspended" | "banned";

export type UserProfile = {
  id: string;
  name?: string | null;
  displayName?: string | null;
  email?: string | null;
  role?: UserRole | null;
  status?: UserStatus | null;
  isSuspended?: boolean;
  balance?: number;
  photoURL?: string | null;
  bio?: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export function isSuspendedUser(user: Pick<UserProfile, "status" | "isSuspended">) {
  return user.isSuspended === true || user.status === "suspended";
}

export async function getUserById(userId: string) {
  const snapshot = await getDoc(doc(db, COLLECTIONS.USERS, userId));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as UserProfile;
}

export async function assertUserNotSuspended(userId: string) {
  const user = await getUserById(userId);

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  if (isSuspendedUser(user)) {
    throw new Error(
      "Akun Anda sedang ditangguhkan. Silakan hubungi admin untuk informasi lebih lanjut."
    );
  }

  return user;
}

export async function getPublicUserProfile(userId: string) {
  const user = await getUserById(userId);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name ?? user.displayName ?? null,
    displayName: user.displayName ?? user.name ?? null,
    email: user.email ?? null,
    role: user.role ?? "user",
    status: user.status ?? "active",
    isSuspended: user.isSuspended ?? user.status === "suspended",
    balance: user.balance ?? 0,
    photoURL: user.photoURL ?? null,
    bio: user.bio ?? null,
    createdAt: user.createdAt ?? null,
    updatedAt: user.updatedAt ?? null,
  } as UserProfile;
}

export async function updateUserProfile(
  userId: string,
  input: {
    name?: string;
    displayName?: string;
    photoURL?: string;
    bio?: string;
  }
) {
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserRole(userId: string, role: UserRole) {
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    role,
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserSuspension(
  userId: string,
  isSuspended: boolean
) {
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    isSuspended,
    status: isSuspended ? "suspended" : "active",
    updatedAt: serverTimestamp(),
  });
}

export async function getAllUsers() {
  const q = query(
    collection(db, COLLECTIONS.USERS),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as UserProfile[];
}

export async function getUsersByRole(role: UserRole) {
  const q = query(
    collection(db, COLLECTIONS.USERS),
    where("role", "==", role),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as UserProfile[];
}