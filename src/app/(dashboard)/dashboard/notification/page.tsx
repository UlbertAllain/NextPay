"use client";

import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { useAuth } from "@/components/providers/auth-provider";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
};

export default function NotificationsPage() {
  const { firebaseUser } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    async function loadNotifications() {
      if (!firebaseUser) return;

      const q = query(
        collection(db, "notifications"),
        where("userId", "==", firebaseUser.uid),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      setNotifications(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[]
      );
    }

    loadNotifications();
  }, [firebaseUser]);

  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>Notifikasi</CardTitle>
        </CardHeader>

        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada notifikasi.
            </p>
          ) : (
            <div className="space-y-3">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-950">
                        {item.title}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.message}
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {item.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}