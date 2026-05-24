import {
  CreatePaymentPayload,
  PaymentProvider,
  PaymentResponse,
} from "./payment-provider";

export class MockPaymentProvider implements PaymentProvider {
  async createPayment(
    payload: CreatePaymentPayload
  ): Promise<PaymentResponse> {
    console.log("MOCK PAYMENT:", payload);

    return {
      reference: `MOCK-PAY-${Date.now()}`,
      checkoutUrl: `/mock-payment/${payload.orderId}`,
      expiredAt: new Date(
        Date.now() + 1000 * 60 * 60
      ).toISOString(),
      provider: "mock",
    };
  }
}