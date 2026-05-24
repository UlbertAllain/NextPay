export type ProductCategory = "game" | "subscription";

export type ProductStatus = "active" | "inactive" | "maintenance";

export type Product = {
  id: string;
  category: ProductCategory;
  name: string;
  slug: string;
  provider: "digiflazz" | "manual";
  providerCode?: string;
  basePrice: number;
  sellPrice: number;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
};