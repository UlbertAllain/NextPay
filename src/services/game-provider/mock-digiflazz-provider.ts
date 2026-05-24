import {
  CreateTopupPayload,
  GameProvider,
  TopupResponse,
} from "./game-provider";

export class MockDigiflazzProvider implements GameProvider {
  async createTopup(
    payload: CreateTopupPayload
  ): Promise<TopupResponse> {
    console.log("MOCK TOPUP:", payload);

    await new Promise((resolve) =>
      setTimeout(resolve, 1500)
    );

    return {
      provider: "mock",
      reference: `MOCK-TOPUP-${Date.now()}`,
      status: "success",
    };
  }
}