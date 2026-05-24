import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { UserRole } from "@/types/user";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
};

type LoginInput = {
  email: string;
  password: string;
};

export async function registerUser({
  name,
  email,
  password,
  role = "user",
}: RegisterInput) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(credential.user, {
    displayName: name,
  });

  await setDoc(doc(db, "users", credential.user.uid), {
    uid: credential.user.uid,
    name,
    email,
    role,
    status: "active",
    balance: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return credential.user;
}

export async function loginUser({ email, password }: LoginInput) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logoutUser() {
  await signOut(auth);
}