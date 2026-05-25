import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Shield } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import type { Property, PropertyImage, University } from "@prisma/client";

type PropertyWithRelations = Property & {
  images: PropertyImage[];
  university: University | null;
};

const typeLabels: Record<string, string> = {
  HOSTEL: "Hostel",
  BEDSITTER: "Bedsitter",
  SINGLE_ROOM: "Single Room",
  APARTMENT: "Apartment",
  SHARED_APARTMENT: "Shared Apartment",
  RENTAL_HOUSE: "Rental House",
};

export function PropertyCard({ property }: { property: PropertyWithRelations }) {
  const imageUrl =
    property.images[0]?.url ||
    "https://images.unsplash.com/photo-1555854877-0b40670a0b0e?w=600&h=400&fit=crop";

  return (
    <Link href={`/properties/${property.slug}`}>
      <Card hover className="group overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={imageUrl}
            alt={property.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {property.featured && (
            <div className="absolute left-3 top-3">
              <Badge variant="warning">
                <Star className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            </div>
          )}
          {property.verified && (
            <div className="absolute right-3 top-3">
              <Badge variant="success">
                <Shield className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Badge variant="info" className="mb-2">
                {typeLabels[property.propertyType] || property.propertyType}
              </Badge>
              <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-emerald-700">
                {property.title}
              </h3>
            </div>
            <p className="shrink-0 text-lg font-bold text-emerald-700">
              {formatCurrency(property.monthlyRent)}
              <span className="text-xs font-normal text-slate-500">/mo</span>
            </p>
          </div>
          <p className="mt-2 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">
              {property.location}
              {property.university && ` · near ${property.university.name}`}
            </span>
          </p>
        </div>
      </Card>
    </Link>
  );
}
