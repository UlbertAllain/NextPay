export type NotificationType =
  | "payment"
  | "topup"
  | "rekber"
  | "system";

export type AppNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
};