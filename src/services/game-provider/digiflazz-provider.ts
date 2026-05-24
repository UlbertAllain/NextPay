import {
  CreateTopupPayload,
  GameProvider,
  TopupResponse,
} from "./game-provider";

export class DigiflazzProvider implements GameProvider {
  async createTopup(
    payload: CreateTopupPayload
  ): Promise<TopupResponse> {
    console.log(payload);

    throw new Error(
      "Digiflazz provider belum diimplementasikan"
    );
  }
}