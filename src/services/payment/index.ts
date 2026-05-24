import { MockPaymentProvider } from "./mock-payment-provider";
import { TripayProvider } from "./tripay-provider";

export function getPaymentProvider() {
  const provider = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER;

  if (provider === "tripay") {
    return new TripayProvider();
  }

  return new MockPaymentProvider();
}