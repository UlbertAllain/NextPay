export type CreateTopupPayload = {
  orderId: string;
  userId: string;
  serverId?: string;
  productCode: string;
};

export type TopupResponse = {
  provider: "mock" | "digiflazz";
  reference: string;
  status: "success" | "processing" | "failed";
};

export interface GameProvider {
  createTopup(
    payload: CreateTopupPayload
  ): Promise<TopupResponse>;
}