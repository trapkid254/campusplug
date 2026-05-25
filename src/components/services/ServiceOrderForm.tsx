"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export function ServiceOrderForm({
  serviceId,
  serviceTitle,
}: {
  serviceId: string;
  serviceTitle: string;
}) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!session) {
    return (
      <div className="mt-4 text-center">
        <p className="text-sm text-slate-600 mb-4">Sign in to request this service</p>
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/services/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        title: form.get("title") || serviceTitle,
        description: form.get("description"),
        budget: form.get("budget") ? parseInt(form.get("budget") as string) : undefined,
      }),
    });

    setLoading(false);
    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to submit order");
    }
  }

  if (success) {
    return (
      <p className="mt-4 text-emerald-700">
        Order submitted! You can track it in your{" "}
        <Link href="/dashboard/student" className="underline">
          dashboard
        </Link>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <Input name="title" label="Project Title" defaultValue={serviceTitle} required />
      <Textarea name="description" label="Project Details" required placeholder="Describe what you need..." />
      <Input name="budget" type="number" label="Budget (KES, optional)" placeholder="5000" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Submitting..." : "Submit Request"}
      </Button>
    </form>
  );
}
