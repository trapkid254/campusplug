"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function DeleteInternshipButton({ internshipId }: { internshipId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this internship posting permanently?")) return;
    setLoading(true);
    await fetch(`/api/internships/${internshipId}`, { method: "DELETE" });
    router.push("/dashboard/provider");
    router.refresh();
  }

  return (
    <Button variant="danger" size="sm" onClick={handleDelete} disabled={loading}>
      {loading ? "Deleting..." : "Delete"}
    </Button>
  );
}
