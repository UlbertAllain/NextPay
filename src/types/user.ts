export type UserRole = "user" | "seller" | "admin" | "super_admin";

export type UserStatus = "active" | "suspended" | "banned";

export type AppUser = {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
};