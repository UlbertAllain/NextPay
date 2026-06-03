"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NotificationItem,
  subscribeNotificationsByUserId,
} from "@/services/notification-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatType(type: string) {
  return type.replaceAll("_", " ");
}

function getTypeBadgeClass(type: string) {
  switch (type) {
    case "rekber":
      return "bg-blue-50 text-blue-700";
    case "wallet":
      return "bg-green-50 text-green-700";
    case "payment":
      return "bg-purple-50 text-purple-700";
    case "order":
      return "bg-orange-50 text-orange-700";
    case "system":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function DashboardNotificationsPage() {
  const { firebaseUser } = useAuth();

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items]
  );

  useEffect(() => {
    if (!firebaseUser) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeNotificationsByUserId(
      firebaseUser.uid,
      (notifications) => {
        setItems(notifications);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser]);

  async function handleMarkAsRead(id: string) {
    try {
      await markNotificationAsRead(id);
    } catch (error) {
      console.error(error);
      alert("Gagal menandai notifikasi");
    }
  }

  async function handleMarkAllAsRead() {
    if (!firebaseUser) return;

    try {
      setActionLoading(true);

      await markAllNotificationsAsRead(firebaseUser.uid);
    } catch (error) {
      console.error(error);
      alert("Gagal menandai semua notifikasi");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Notifikasi</h1>
          <p className="mt-2 text-sm text-slate-500">
            Pantau update transaksi, rekber, wallet, dan sistem secara realtime.
          </p>
        </div>

        <Button
          onClick={handleMarkAllAsRead}
          disabled={actionLoading || unreadCount === 0}
        >
          {actionLoading ? "Memproses..." : "Tandai Semua Dibaca"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Notifikasi ({unreadCount} belum dibaca)</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Memuat notifikasi...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada notifikasi.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 ${
                    item.read
                      ? "border-slate-200 bg-white"
                      : "border-blue-200 bg-blue-50/40"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-slate-950">
                          {item.title}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getTypeBadgeClass(
                            item.type
                          )}`}
                        >
                          {formatType(item.type)}
                        </span>

                        {!item.read && (
                          <span className="rounded-full bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white">
                            NEW
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.message}
                      </p>
                    </div>

                    {!item.read && (
                      <Button
                        variant="secondary"
                        onClick={() => handleMarkAsRead(item.id)}
                      >
                        Tandai Dibaca
                      </Button>
                    )}
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