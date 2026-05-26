export type CreateTopupPayload = {
  orderId: string;
  userId: string;
  serverId?: string | null;
  productCode: string;
};

export type CreateTopupResponse = {
  reference: string;
  status: "success" | "failed" | "processing";
  provider: "mock" | "digiflazz";
  message?: string;
};

export interface GameProvider {
  createTopup(payload: CreateTopupPayload): Promise<CreateTopupResponse>;
}