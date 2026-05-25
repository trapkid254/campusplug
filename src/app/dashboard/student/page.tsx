import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { DashboardShell, DashboardNav } from "@/components/dashboard/DashboardShell";
import { PropertyCard } from "@/components/properties/PropertyCard";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";

const nav = [
  { href: "/dashboard/student", label: "Overview" },
  { href: "/dashboard/student/favorites", label: "Saved Properties" },
  { href: "/dashboard/student/applications", label: "My Applications" },
  { href: "/dashboard/student/orders", label: "Service Orders" },
];

export default async function StudentDashboard() {
  const session = await requireAuth(["STUDENT"]);

  const [favorites, applications, orders] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: { property: { include: { images: { take: 1 }, university: true } } },
      take: 6,
    }),
    prisma.internshipApplication.findMany({
      where: { studentId: session.user.id },
      include: { internship: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.serviceOrder.findMany({
      where: { studentId: session.user.id },
      include: { service: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <DashboardShell title={`Welcome, ${session.user.name}`} nav={<DashboardNav links={nav} />}>
      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Saved Properties</h2>
          {favorites.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {favorites.map((f) => (
                <PropertyCard key={f.id} property={f.property} />
              ))}
            </div>
          ) : (
            <Card className="mt-4 p-8 text-center text-slate-500">
              <p>No saved properties yet.</p>
              <Link href="/properties" className="mt-4 inline-block">
                <Button variant="outline" size="sm">Browse Housing</Button>
              </Link>
            </Card>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Recent Applications</h2>
          {applications.length > 0 ? (
            <div className="mt-4 space-y-3">
              {applications.map((app) => (
                <Card key={app.id} className="p-4">
                  <p className="font-medium">{app.internship.title}</p>
                  <p className="text-sm text-slate-500">{app.internship.companyName}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Applied {format(app.createdAt, "dd MMM yyyy")} · {app.status}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mt-4 p-6 text-center text-slate-500 text-sm">No applications yet</Card>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Service Orders</h2>
          {orders.length > 0 ? (
            <div className="mt-4 space-y-3">
              {orders.map((order) => (
                <Card key={order.id} className="p-4">
                  <p className="font-medium">{order.title}</p>
                  <p className="text-sm text-slate-500">{order.service.title}</p>
                  <p className="mt-1 text-xs capitalize text-emerald-700">{order.status.toLowerCase()}</p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mt-4 p-6 text-center text-slate-500 text-sm">No service orders yet</Card>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
