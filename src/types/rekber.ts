export type RekberStatus =
  | "waiting_payment"
  | "holding_fund"
  | "waiting_delivery"
  | "waiting_confirmation"
  | "completed"
  | "dispute"
  | "refunded"
  | "cancelled";

export type RekberTransaction = {
  id: string;
  invoice: string;
  buyerId: string;
  sellerId?: string;
  sellerContact: string;
  itemName: string;
  itemDescription: string;
  amount: number;
  fee: number;
  totalAmount: number;
  status: RekberStatus;
  createdAt: Date;
  updatedAt: Date;
};