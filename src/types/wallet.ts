export type WalletTransactionType =
  | "rekber_release"
  | "withdrawal"
  | "refund"
  | "adjustment";

export type WalletTransaction = {
  id: string;
  userId: string;
  type: WalletTransactionType;
  amount: number;
  description: string;
  referenceId?: string;
  createdAt: Date;
};