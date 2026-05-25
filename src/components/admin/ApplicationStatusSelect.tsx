"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

const statuses = ["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED", "ACCEPTED"];

export function ApplicationStatusSelect({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function updateStatus(status: string) {
    await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <select
      disabled={pending}
      defaultValue={currentStatus}
      onChange={(e) => startTransition(() => updateStatus(e.target.value))}
      className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
