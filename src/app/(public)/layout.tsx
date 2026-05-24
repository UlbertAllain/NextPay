import { PublicNavbar } from "@/components/layout/public-navbar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-slate-50">
      <PublicNavbar />
      {children}
    </main>
  );
}