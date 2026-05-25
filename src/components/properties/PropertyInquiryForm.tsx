"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export function PropertyInquiryForm({ propertyId }: { propertyId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId,
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        message: form.get("message"),
      }),
    });

    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to send inquiry");
    }
  }

  if (success) {
    return (
      <p className="mt-4 text-sm text-emerald-700">
        Your inquiry has been sent! The landlord will contact you soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <Input name="name" label="Your Name" required placeholder="John Doe" />
      <Input name="email" type="email" label="Email" required placeholder="you@email.com" />
      <Input name="phone" label="Phone" required placeholder="0712345678" />
      <Textarea name="message" label="Message" required placeholder="I'm interested in viewing..." />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Sending..." : "Send Inquiry"}
      </Button>
    </form>
  );
}
