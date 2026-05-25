"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import {
  moderateProperty,
  moderateInternship,
} from "@/lib/actions/admin";

export function PropertyModerationButtons({
  id,
  status,
  featured,
}: {
  id: string;
  status: string;
  featured: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function run(action: Parameters<typeof moderateProperty>[1]) {
    startTransition(() => moderateProperty(id, action));
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "PENDING" && (
        <>
          <Button size="sm" disabled={pending} onClick={() => run("approve")}>
            Approve
          </Button>
          <Button size="sm" variant="danger" disabled={pending} onClick={() => run("reject")}>
            Reject
          </Button>
        </>
      )}
      {status === "APPROVED" && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => run(featured ? "unfeature" : "feature")}
        >
          {featured ? "Unfeature" : "Feature"}
        </Button>
      )}
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => run("verify")}>
        Verify
      </Button>
    </div>
  );
}

export function InternshipModerationButtons({
  id,
  status,
  featured,
}: {
  id: string;
  status: string;
  featured: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function run(action: Parameters<typeof moderateInternship>[1]) {
    startTransition(() => moderateInternship(id, action));
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "PENDING" && (
        <>
          <Button size="sm" disabled={pending} onClick={() => run("approve")}>
            Approve
          </Button>
          <Button size="sm" variant="danger" disabled={pending} onClick={() => run("reject")}>
            Reject
          </Button>
        </>
      )}
      {status === "APPROVED" && (
        <>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => run(featured ? "unfeature" : "feature")}
          >
            {featured ? "Unfeature" : "Feature"}
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => run("close")}>
            Close
          </Button>
        </>
      )}
    </div>
  );
}
