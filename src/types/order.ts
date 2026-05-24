export type OrderType = "topup" | "account" | "rekber" | "subscription";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "success"
  | "failed"
  | "cancelled"
  | "refunded"
  | "dispute";

export type PaymentStatus =
  | "unpaid"
  | "paid"
  | "expired"
  | "failed"
  | "refunded";

export type Order = {
  id: string;
  invoice: string;
  userId: string;
  type: OrderType;
  title: string;
  amount: number;
  adminFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentProvider: "tripay";
  paymentReference?: string;
  paymentCheckoutUrl?: string;
  paymentExpiredAt?: string;
  providerReference?: string;
fulfilledBy?: "mock" | "digiflazz";
fulfilledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};