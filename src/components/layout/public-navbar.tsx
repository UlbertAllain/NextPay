import Link from "next/link";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Top Up Game", href: "/topup" },
  { label: "Akun ML", href: "/akun-ml" },
  { label: "Rekber", href: "/rekber" },
  { label: "Subscription", href: "/subscription" },
  { label: "Cek Transaksi", href: "/cek-transaksi" },
];

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-950">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
            N
          </div>
          <span>NextPay</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-blue-600">
              {item.label}
            </Link>
          ))}
        </nav>

       <div className="flex items-center gap-2">
  <Link href="/login">
    <Button variant="secondary">Masuk</Button>
  </Link>

  <Link href="/register">
    <Button>Daftar</Button>
  </Link>
</div>
      </div>
    </header>
  );
}