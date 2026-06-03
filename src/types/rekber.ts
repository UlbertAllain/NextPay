export type RekberStatus =
  | "waiting_payment"
  | "holding_fund"
  | "waiting_delivery"
  | "waiting_confirmation"
  | "completed"
  | "dispute"
  | "refunded"
  | "cancelled";

export type RekberPaymentStatus =
  | "unpaid"
  | "paid"
  | "expired"
  | "refunded";

export type RekberTransaction = {
  id: string;
  invoice: string;

  buyerId: string;
  sellerId?: string | null;
  sellerContact: string;

  itemName: string;
  itemDescription: string;

  amount: number;
  fee: number;
  totalAmount: number;

  sourceType?: "manual" | "account_listing";
  sourceId?: string | null;

  status: RekberStatus;
  paymentStatus: RekberPaymentStatus;

  createdAt: unknown;
  updatedAt: unknown;

  paidAt?: unknown;
  deliveredAt?: unknown;
  completedAt?: unknown;
  disputedAt?: unknown;
  refundedAt?: unknown;
  releasedByAdminAt?: unknown;
  expiredAt?: unknown;
  cancelledAt?: unknown;
};