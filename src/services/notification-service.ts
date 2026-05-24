import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";

type CreateNotificationPayload = {
  userId: string;
  title: string;
  message: string;
  type: "payment" | "topup" | "rekber" | "system";
};

export async function createNotification(
  payload: CreateNotificationPayload
) {
  await addDoc(collection(db, "notifications"), {
    userId: payload.userId,
    title: payload.title,
    message: payload.message,
    type: payload.type,
    read: false,
    createdAt: serverTimestamp(),
  });
}