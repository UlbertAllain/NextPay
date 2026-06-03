"use client";

import { useEffect, useState } from "react";

import {
  approveWithdrawal,
  getAllWithdrawals,
  rejectWithdrawal,
  WithdrawalRequest,
} from "@/services/withdrawal-service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "pending":
      return "bg-orange-50 text-orange-700";
    case "approved":
      return "bg-green-50 text-green-700";
    case "rejected":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function AdminWithdrawalsPage() {
  const [items, setItems] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  async function loadWithdrawals() {
    try {
      setLoading(true);

      const data = await getAllWithdrawals();
      setItems(data);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data withdrawal");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWithdrawals();
  }, []);

  async function handleApprove(id: string) {
    const confirmed = confirm(
      "Setujui withdrawal ini? Pastikan transfer manual ke rekening seller sudah dilakukan."
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(id);

      await approveWithdrawal(id);
      await loadWithdrawals();
    } catch (error) {
      console.error(error);
      alert("Gagal approve withdrawal");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReject(id: string) {
    const note =
      prompt("Masukkan alasan penolakan withdrawal:") ||
      "Withdrawal ditolak admin";

    const confirmed = confirm(
      "Tolak withdrawal ini? Saldo akan dikembalikan ke wallet user."
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(id);

      await rejectWithdrawal(id, note);
      await loadWithdrawals();
    } catch (error) {
      console.error(error);
      alert("Gagal reject withdrawal");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">
          Admin Withdrawal
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Kelola pengajuan pencairan saldo seller. Approve dilakukan setelah
          admin memproses transfer manual.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Withdrawal</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Memuat withdrawal...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada pengajuan withdrawal.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-3 pr-4 font-medium">User</th>
                    <th className="py-3 pr-4 font-medium">Nominal</th>
                    <th className="py-3 pr-4 font-medium">Bank</th>
                    <th className="py-3 pr-4 font-medium">Nomor</th>
                    <th className="py-3 pr-4 font-medium">Pemilik</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Catatan</th>
                    <th className="py-3 pr-4 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => {
                    const isActionLoading = actionLoadingId === item.id;

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 align-top"
                      >
                        <td className="py-4 pr-4">
                          <p className="max-w-[180px] break-all text-xs text-slate-600">
                            {item.userId}
                          </p>
                        </td>

                        <td className="py-4 pr-4 font-semibold text-slate-950">
                          {formatRupiah(item.amount)}
                        </td>

                        <td className="py-4 pr-4">{item.bankName}</td>

                        <td className="py-4 pr-4">
                          {item.accountNumber}
                        </td>

                        <td className="py-4 pr-4">
                          {item.accountHolderName}
                        </td>

                        <td className="py-4 pr-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadgeClass(
                              item.status
                            )}`}
                          >
                            {formatStatus(item.status)}
                          </span>
                        </td>

                        <td className="py-4 pr-4">
                          <p className="max-w-xs text-xs text-slate-500">
                            {item.note || "-"}
                          </p>
                        </td>

                        <td className="py-4 pr-4">
                          {item.status === "pending" ? (
                            <div className="flex min-w-[150px] flex-col gap-2">
                              <Button
                                onClick={() => handleApprove(item.id)}
                                disabled={isActionLoading}
                              >
                                {isActionLoading
                                  ? "Memproses..."
                                  : "Approve"}
                              </Button>

                              <Button
                                variant="danger"
                                onClick={() => handleReject(item.id)}
                                disabled={isActionLoading}
                              >
                                {isActionLoading
                                  ? "Memproses..."
                                  : "Reject"}
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">
                              Sudah diproses
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}