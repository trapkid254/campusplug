"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { AuthDivider } from "@/components/auth/AuthDivider";

export default function RegisterForm({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole =
    searchParams.get("role") === "landlord"
      ? "LANDLORD"
      : searchParams.get("role") === "provider"
        ? "INTERNSHIP_PROVIDER"
        : "STUDENT";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        phone: form.get("phone"),
        role: form.get("role"),
        companyName: form.get("companyName") || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push("/login?registered=1");
    } else {
      setError(data.error || "Registration failed");
    }
  }

  return (
    <Card className="w-full max-w-md p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Join CampusPlug</h1>
        <p className="mt-2 text-sm text-slate-600">Create your free account today</p>
      </div>
      {googleEnabled && (
        <>
          <div className="mt-6">
            <GoogleSignInButton callbackUrl="/dashboard" label="Sign up with Google" />
          </div>
          <AuthDivider />
        </>
      )}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input name="name" label="Full Name" required placeholder="John Doe" />
        <Input name="email" type="email" label="Email" required placeholder="you@email.com" />
        <Input name="phone" label="Phone (for SMS alerts)" required placeholder="0712345678" />
        <Input
          name="password"
          type="password"
          label="Password"
          required
          minLength={6}
          placeholder="Min 6 characters"
        />
        <Select
          name="role"
          label="I am a..."
          defaultValue={defaultRole}
          options={[
            { value: "STUDENT", label: "Student" },
            { value: "LANDLORD", label: "Landlord / Agent" },
            { value: "INTERNSHIP_PROVIDER", label: "Internship Provider" },
          ]}
        />
        <Input name="companyName" label="Company Name (for providers)" placeholder="Optional" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald-700 hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
