"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { AuthDivider } from "@/components/auth/AuthDivider";

export default function LoginForm({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email") as string,
      password: form.get("password") as string,
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in to your CampusPlug account</p>
        </div>
        {googleEnabled && (
          <>
            <div className="mt-6">
              <GoogleSignInButton callbackUrl={callbackUrl} />
            </div>
            <AuthDivider />
          </>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="email" type="email" label="Email" required placeholder="you@email.com" />
          <Input name="password" type="password" label="Password" required placeholder="••••••••" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <p className="mt-4 text-right text-sm">
          <Link href="/forgot-password" className="text-emerald-700 hover:underline">
            Forgot password?
          </Link>
        </p>
        <p className="mt-4 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-emerald-700 hover:underline">
            Register
          </Link>
        </p>
        <div className="mt-6 rounded-lg bg-slate-50 p-4 text-xs text-slate-500">
          <p className="font-medium text-slate-700">Demo accounts:</p>
          <p>Admin: admin@campusplug.co.ke / admin123</p>
          <p>Student: student@campusplug.co.ke / student123</p>
          <p>Landlord: landlord@campusplug.co.ke / landlord123</p>
        </div>
      </Card>
    </div>
  );
}
