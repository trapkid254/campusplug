"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });

    setLoading(false);
    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json();
      setError(data.error || "Request failed");
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-slate-900">Forgot password?</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {sent ? (
          <div className="mt-6">
            <p className="text-emerald-700">
              If an account exists for that email, you&apos;ll receive a reset link shortly.
            </p>
            <Link href="/login" className="mt-4 inline-block text-sm text-emerald-700 hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input name="email" type="email" label="Email" required placeholder="you@email.com" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
            <Link href="/login" className="block text-center text-sm text-slate-600 hover:text-emerald-700">
              Back to login
            </Link>
          </form>
        )}
      </Card>
    </div>
  );
}
