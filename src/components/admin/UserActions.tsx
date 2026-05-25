"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { toggleUserVerified, deleteUser } from "@/lib/actions/admin";

export function UserActions({
  userId,
  verified,
  role,
}: {
  userId: string;
  verified: boolean;
  role: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-1">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => startTransition(() => toggleUserVerified(userId))}
      >
        {verified ? "Unverify" : "Verify"}
      </Button>
      {role !== "ADMIN" && (
        <Button
          size="sm"
          variant="danger"
          disabled={pending}
          onClick={() => {
            if (confirm("Delete this user permanently?")) {
              startTransition(() => deleteUser(userId));
            }
          }}
        >
          Delete
        </Button>
      )}
    </div>
  );
}
