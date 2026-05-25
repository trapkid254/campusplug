"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions/admin";

const statuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      disabled={pending}
      defaultValue={currentStatus}
      onChange={(e) =>
        startTransition(() => updateOrderStatus(orderId, e.target.value))
      }
      className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
