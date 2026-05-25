"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function DeletePropertyButton({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this listing permanently?")) return;
    setLoading(true);
    await fetch(`/api/properties/${propertyId}`, { method: "DELETE" });
    router.push("/dashboard/landlord");
    router.refresh();
  }

  return (
    <Button variant="danger" size="sm" onClick={handleDelete} disabled={loading}>
      {loading ? "Deleting..." : "Delete"}
    </Button>
  );
}
