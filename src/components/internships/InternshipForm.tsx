"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { INTERNSHIP_CATEGORIES } from "@/lib/utils";

type InternshipInitial = {
  id: string;
  title: string;
  companyName: string;
  location: string;
  category: string;
  duration: string;
  requirements: string;
  description: string;
  applicationDeadline: Date | string;
  applicationInstructions: string;
  stipend?: string | null;
  paid: boolean;
  workMode: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
};

export function InternshipForm({
  companyName,
  initial,
}: {
  companyName?: string;
  initial?: InternshipInitial;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const defaultDeadline = new Date();
  defaultDeadline.setMonth(defaultDeadline.getMonth() + 2);
  const deadlineStr = initial
    ? new Date(initial.applicationDeadline).toISOString().split("T")[0]
    : defaultDeadline.toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const payload = {
      title: form.get("title"),
      companyName: form.get("companyName"),
      location: form.get("location"),
      category: form.get("category"),
      duration: form.get("duration"),
      requirements: form.get("requirements"),
      description: form.get("description"),
      applicationDeadline: form.get("applicationDeadline"),
      applicationInstructions: form.get("applicationInstructions"),
      stipend: form.get("stipend") || null,
      paid: form.get("paid") === "true",
      workMode: form.get("workMode"),
      contactEmail: form.get("contactEmail") || null,
      contactPhone: form.get("contactPhone") || null,
    };

    const url = initial ? `/api/internships/${initial.id}` : "/api/internships";
    const method = initial ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push("/dashboard/provider");
      router.refresh();
    } else {
      setError(data.error || "Failed to save internship");
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          name="title"
          label="Job Title"
          required
          defaultValue={initial?.title}
          placeholder="Software Engineering Intern"
        />
        <Input
          name="companyName"
          label="Company Name"
          required
          defaultValue={initial?.companyName || companyName}
          placeholder="Your Company Ltd"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="location"
            label="Location"
            required
            defaultValue={initial?.location}
            placeholder="Nairobi"
          />
          <Select
            name="category"
            label="Category"
            required
            defaultValue={initial?.category}
            options={[...INTERNSHIP_CATEGORIES]}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            name="duration"
            label="Duration"
            required
            defaultValue={initial?.duration}
            placeholder="3 months"
          />
          <Select
            name="workMode"
            label="Work Mode"
            defaultValue={initial?.workMode || "ONSITE"}
            options={[
              { value: "ONSITE", label: "On-site" },
              { value: "REMOTE", label: "Remote" },
              { value: "HYBRID", label: "Hybrid" },
            ]}
          />
          <Select
            name="paid"
            label="Paid?"
            defaultValue={initial?.paid ? "true" : "false"}
            options={[
              { value: "true", label: "Paid" },
              { value: "false", label: "Unpaid" },
            ]}
          />
        </div>

        <Input
          name="stipend"
          label="Stipend (optional)"
          defaultValue={initial?.stipend || ""}
          placeholder="KES 25,000/month"
        />

        <Textarea
          name="description"
          label="Role Description"
          required
          defaultValue={initial?.description}
          placeholder="Describe the internship role..."
        />
        <Textarea
          name="requirements"
          label="Requirements"
          required
          defaultValue={initial?.requirements}
          placeholder="Qualifications, skills..."
        />
        <Textarea
          name="applicationInstructions"
          label="Application Instructions"
          required
          defaultValue={initial?.applicationInstructions}
          placeholder="How should students apply?"
        />

        <Input
          name="applicationDeadline"
          label="Application Deadline"
          type="date"
          required
          defaultValue={deadlineStr}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="contactEmail"
            type="email"
            label="Contact Email"
            defaultValue={initial?.contactEmail || ""}
            placeholder="hr@company.com"
          />
          <Input
            name="contactPhone"
            label="Contact Phone"
            defaultValue={initial?.contactPhone || ""}
            placeholder="0712345678"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : initial
                ? "Update Posting"
                : "Submit for Approval"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>

        {!initial && (
          <p className="text-xs text-slate-500">
            Postings are reviewed by admin before going live.
          </p>
        )}
        {initial && (
          <p className="text-xs text-amber-600">
            Editing will reset status to pending for re-approval (unless you are admin).
          </p>
        )}
      </form>
    </Card>
  );
}
