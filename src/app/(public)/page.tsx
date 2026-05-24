import { ShieldCheck, Gamepad2, BadgeCheck, Headphones } from "lucide-react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    title: "Top Up Game",
    desc: "ML, PUBG, HOK, Free Fire, dan game populer lainnya.",
    icon: Gamepad2,
  },
  {
    title: "Jual Beli Akun ML",
    desc: "Marketplace akun Mobile Legends dengan sistem verifikasi.",
    icon: BadgeCheck,
  },
  {
    title: "Jasa Rekber",
    desc: "Dana ditahan sampai transaksi selesai dan aman.",
    icon: ShieldCheck,
  },
  {
    title: "Subscription",
    desc: "Canva Pro, Spotify, Netflix, CapCut, dan layanan digital.",
    icon: Headphones,
  },
];

export default function HomePage() {
  return (
    
    <section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            Platform transaksi digital untuk gamer
          </div>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
            Top Up Game, Akun ML, Rekber & Subscription dalam Satu Platform.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            NextPay membantu transaksi digital berjalan lebih cepat, rapi, dan
            aman melalui pembayaran otomatis, sistem order, dan dashboard
            terintegrasi.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button className="h-11 px-6">Top Up Sekarang</Button>
            <Button variant="secondary" className="h-11 px-6">
              Lihat Semua Layanan
            </Button>
          </div>

          <div className="mt-8 grid max-w-xl gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <div>✓ Proses cepat</div>
            <div>✓ Payment otomatis</div>
            <div>✓ Rekber aman</div>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="rounded-2xl bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300">Saldo Wallet</p>
                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-200">
                  Aktif
                </span>
              </div>

              <div className="mt-3 text-3xl font-bold">Rp 1.250.000</div>

              <div className="mt-6 grid grid-cols-4 gap-3">
                {["Top Up", "Rekber", "History", "Profile"].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl bg-white/10 p-3 text-center text-xs text-slate-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                ["Top Up ML - 86 Diamond", "Berhasil", "Rp 23.000"],
                ["Canva Pro 1 Bulan", "Berhasil", "Rp 39.000"],
                ["Rekber Akun ML", "Proses", "Rp 450.000"],
              ].map(([title, status, price]) => (
                <div
                  key={title}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">{title}</p>
                    <p className="text-sm text-slate-500">{status}</p>
                  </div>
                  <p className="font-semibold text-slate-900">{price}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-4 md:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <Card key={service.title}>
                <CardContent className="p-5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-semibold text-slate-950">{service.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {service.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    
    </section>
    
  );
}