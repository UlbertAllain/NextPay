import {
  CreatePaymentPayload,
  PaymentProvider,
  PaymentResponse,
} from "./payment-provider";

export class TripayProvider implements PaymentProvider {
  async createPayment(
    payload: CreatePaymentPayload
  ): Promise<PaymentResponse> {
    console.log(payload);

    throw new Error(
      "Tripay provider belum diimplementasikan"
    );
  }
}