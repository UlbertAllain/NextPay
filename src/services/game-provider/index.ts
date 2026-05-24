import { DigiflazzProvider } from "./digiflazz-provider";
import { MockDigiflazzProvider } from "./mock-digiflazz-provider";

export function getGameProvider() {
  const provider = process.env.NEXT_PUBLIC_GAME_PROVIDER;

  if (provider === "digiflazz") {
    return new DigiflazzProvider();
  }

  return new MockDigiflazzProvider();
}