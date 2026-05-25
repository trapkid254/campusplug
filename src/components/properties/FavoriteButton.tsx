"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  propertyId,
  initialFavorited = false,
}: {
  propertyId: string;
  initialFavorited?: boolean;
}) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  if (!session) return null;

  async function toggle() {
    setLoading(true);
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setFavorited(data.favorited);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={cn(favorited && "border-red-300 text-red-600 hover:bg-red-50")}
    >
      <Heart className={cn("h-4 w-4", favorited && "fill-current")} />
      {favorited ? "Saved" : "Save"}
    </Button>
  );
}
