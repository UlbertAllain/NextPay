import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/constants/collections";

export type NotificationType =
  | "order"
  | "payment"
  | "rekber"
  | "wallet"
  | "system";

export type NotificationItem = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: unknown;
};

export async function createNotification(input: {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
}) {
  await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
    userId: input.userId,
    title: input.title,
    message: input.message,
    type: input.type,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function getNotificationsByUserId(userId: string) {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as NotificationItem[];
}

export function subscribeNotificationsByUserId(
  userId: string,
  callback: (items: NotificationItem[]) => void
) {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(20)
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    })) as NotificationItem[];

    callback(items);
  });
}

export async function markNotificationAsRead(notificationId: string) {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), {
    read: true,
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where("userId", "==", userId),
    where("read", "==", false)
  );

  const snapshot = await getDocs(q);

  await Promise.all(
    snapshot.docs.map((document) =>
      updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, document.id), {
        read: true,
      })
    )
  );
}