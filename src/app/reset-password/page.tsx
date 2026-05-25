"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <Card className="w-full max-w-md p-8 text-center">
        <p className="text-red-600">Invalid reset link.</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-emerald-700 hover:underline">
          Request a new link
        </Link>
      </Card>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;

    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push("/login?reset=1");
    } else {
      setError(data.error || "Reset failed");
    }
  }

  return (
    <Card className="w-full max-w-md p-8">
      <h1 className="text-2xl font-bold text-slate-900">Set new password</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input name="password" type="password" label="New Password" required minLength={6} />
        <Input name="confirm" type="password" label="Confirm Password" required minLength={6} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-slate-500">Loading...</div>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
