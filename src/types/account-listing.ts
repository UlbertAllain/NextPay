export type AccountGame =
  | "mobile-legends"
  | "pubg-mobile"
  | "free-fire"
  | "honor-of-kings";

export type AccountListingStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "reserved"
  | "sold"
  | "hidden"
  | "rejected";

export type AccountListing = {
  id: string;
  sellerId: string;
  game: AccountGame;
  title: string;
  description: string;
  price: number;
  rank?: string | null;
  level?: number | null;
  skins?: number | null;
  heroes?: number | null;
  images: string[];
  verified: boolean;
  status: AccountListingStatus;
  reservedRekberId?: string | null;
  reservedAt?: unknown;
  soldAt?: unknown;
  createdAt: unknown;
  updatedAt: unknown;
};