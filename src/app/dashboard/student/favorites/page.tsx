import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DashboardShell, DashboardNav } from "@/components/dashboard/DashboardShell";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

const nav = [
  { href: "/dashboard/student", label: "Overview" },
  { href: "/dashboard/student/applications", label: "My Applications" },
  { href: "/dashboard/student/orders", label: "Service Orders" },
  { href: "/dashboard/student/favorites", label: "Saved Properties" },
];

export default async function StudentFavoritesPage() {
  const session = await requireAuth(["STUDENT"]);

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      property: { include: { images: { take: 1 }, university: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell title="Saved Properties" nav={<DashboardNav links={nav} />}>
      {favorites.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {favorites.map((f) => (
            <PropertyCard key={f.id} property={f.property} />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center text-slate-500">
          <p>No saved properties.</p>
          <Link href="/properties" className="mt-4 inline-block text-emerald-700 hover:underline">
            Browse housing →
          </Link>
        </Card>
      )}
    </DashboardShell>
  );
}
