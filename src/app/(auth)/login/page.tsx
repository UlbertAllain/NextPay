"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { loginUser } from "@/services/auth-service";
import { useRedirectIfAuthenticated } from "@/hooks/use-redirect-if-authenticated";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  useRedirectIfAuthenticated();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);

      await loginUser({
        email,
        password,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Login gagal");
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
              Login NextPay
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Masuk ke akun untuk melanjutkan transaksi.
            </p>
          </div>

          <div className="space-y-4">
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
              onClick={handleLogin}
              disabled={loading}
              className="h-11 w-full"
            >
              {loading ? "Loading..." : "Login"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}