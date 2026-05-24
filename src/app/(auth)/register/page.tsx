"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { registerUser } from "@/services/auth-service";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRedirectIfAuthenticated } from "@/hooks/use-redirect-if-authenticated";

export default function RegisterPage() {
  const router = useRouter();
useRedirectIfAuthenticated();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    try {
      setLoading(true);

      await registerUser({
        name,
        email,
        password,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Register gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-950">
              Register NextPay
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Buat akun baru untuk mulai transaksi.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Nama
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 outline-none"
              />
            </div>

            <Button
              onClick={handleRegister}
              disabled={loading}
              className="h-11 w-full"
            >
              {loading ? "Loading..." : "Register"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}