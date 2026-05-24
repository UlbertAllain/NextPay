export type CreatePaymentPayload = {
  orderId: string;
  invoice: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
};

export type PaymentResponse = {
  reference: string;
  checkoutUrl: string;
  expiredAt: string;
  provider: "mock" | "tripay";
};

export interface PaymentProvider {
  createPayment(
    payload: CreatePaymentPayload
  ): Promise<PaymentResponse>;
}