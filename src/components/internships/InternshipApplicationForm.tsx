"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

export function InternshipApplicationForm({ internshipId }: { internshipId: string }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!session) {
    return (
      <div className="text-center">
        <p className="text-sm text-slate-600 mb-4">Sign in to apply for this internship</p>
        <Link href={`/login?callbackUrl=/internships`}>
          <Button className="w-full">Sign In to Apply</Button>
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/internships/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        internshipId,
        coverLetter: form.get("coverLetter"),
      }),
    });

    setLoading(false);
    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json();
      setError(data.error || "Application failed");
    }
  }

  if (success) {
    return <p className="text-sm text-emerald-700">Application submitted successfully!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        name="coverLetter"
        label="Cover Letter"
        required
        placeholder="Tell us why you're a great fit..."
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Submitting..." : "Apply Now"}
      </Button>
    </form>
  );
}
