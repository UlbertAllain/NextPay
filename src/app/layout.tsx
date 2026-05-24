import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";

export const metadata: Metadata = {
  title: "NextPay",
  description: "Top up game, akun ML, rekber, dan subscription digital.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
  <AuthProvider>
    {children}
  </AuthProvider>
</body>
    </html>
  );
}