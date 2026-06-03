import type { Timestamp } from "firebase/firestore";

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
  | "waiting_verification"
  | "paid"
  | "rejected"
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
  paymentStatus?: RekberPaymentStatus;

  paymentProofUrl?: string | null;
  paymentProofPublicId?: string | null;
  paymentProofUploadedAt?: Date | Timestamp | null;

  paymentVerifiedBy?: string | null;
  paymentVerifiedAt?: Date | Timestamp | null;

  paymentRejectedReason?: string | null;
  paymentRejectedAt?: Date | Timestamp | null;

  paidAt?: Date | Timestamp | null;
  expiredAt?: Date | Timestamp | null;
  cancelledAt?: Date | Timestamp | null;
  deliveredAt?: Date | Timestamp | null;
  completedAt?: Date | Timestamp | null;
  disputedAt?: Date | Timestamp | null;
  refundedAt?: Date | Timestamp | null;
  releasedByAdminAt?: Date | Timestamp | null;

  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};