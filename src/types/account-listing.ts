export type AccountGame =
  | "mobile-legends"
  | "pubg-mobile"
  | "free-fire"
  | "honor-of-kings";

export type AccountListingStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "sold"
  | "rejected";

export type AccountListing = {
  id: string;

  sellerId: string;

  game: AccountGame;

  title: string;
  description: string;

  price: number;

  rank?: string;

  level?: number;

  skins?: number;
  heroes?: number;

  images: string[];

  verified: boolean;

  status: AccountListingStatus;

  createdAt: Date;
  updatedAt: Date;
};