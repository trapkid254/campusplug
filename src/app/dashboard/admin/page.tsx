import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/dashboard/AdminShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { PropertyModerationButtons } from "@/components/admin/ModerationButtons";
import { InternshipModerationButtons } from "@/components/admin/ModerationButtons";

export default async function AdminDashboard() {
  await requireAuth(["ADMIN"]);

  const [
    userCount,
    propertyCount,
    pendingProperties,
    internshipCount,
    pendingInternships,
    orderCount,
    pendingOrders,
    payments,
    pendingProps,
    pendingInts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.property.count({ where: { status: "APPROVED" } }),
    prisma.property.count({ where: { status: "PENDING" } }),
    prisma.internship.count({ where: { status: "APPROVED" } }),
    prisma.internship.count({ where: { status: "PENDING" } }),
    prisma.serviceOrder.count(),
    prisma.serviceOrder.count({ where: { status: "PENDING" } }),
    prisma.payment.findMany({
      where: { status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.property.findMany({
      where: { status: "PENDING" },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { landlord: { select: { name: true } } },
    }),
    prisma.internship.findMany({
      where: { status: "PENDING" },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const revenue = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <AdminShell title="Overview" description="CampusPlug platform management">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Users", value: userCount, href: "/dashboard/admin/users" },
          { label: "Active Listings", value: propertyCount, href: "/dashboard/admin/properties" },
          { label: "Internships", value: internshipCount, href: "/dashboard/admin/internships" },
          { label: "Revenue", value: formatCurrency(revenue), href: "/dashboard/admin/payments" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="p-5 transition hover:shadow-md">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {pendingProperties > 0 && (
          <Badge variant="warning">{pendingProperties} properties awaiting review</Badge>
        )}
        {pendingInternships > 0 && (
          <Badge variant="warning">{pendingInternships} internships awaiting review</Badge>
        )}
        {pendingOrders > 0 && (
          <Badge variant="info">{pendingOrders} service orders pending</Badge>
        )}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-semibold text-slate-900">Pending Properties</h2>
          <div className="mt-4 space-y-3">
            {pendingProps.map((p) => (
              <Card key={p.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-sm text-slate-500">
                      {formatCurrency(p.monthlyRent)}/mo · {p.landlord?.name || "Admin listing"}
                    </p>
                  </div>
                  <PropertyModerationButtons
                    id={p.id}
                    status={p.status}
                    featured={p.featured}
                  />
                </div>
              </Card>
            ))}
            {pendingProps.length === 0 && (
              <Card className="p-6 text-center text-sm text-slate-500">All caught up!</Card>
            )}
          </div>
          <Link
            href="/dashboard/admin/properties"
            className="mt-3 inline-block text-sm text-emerald-700 hover:underline"
          >
            View all properties →
          </Link>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900">Pending Internships</h2>
          <div className="mt-4 space-y-3">
            {pendingInts.map((i) => (
              <Card key={i.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{i.title}</p>
                    <p className="text-sm text-slate-500">{i.companyName}</p>
                  </div>
                  <InternshipModerationButtons
                    id={i.id}
                    status={i.status}
                    featured={i.featured}
                  />
                </div>
              </Card>
            ))}
            {pendingInts.length === 0 && (
              <Card className="p-6 text-center text-sm text-slate-500">All caught up!</Card>
            )}
          </div>
          <Link
            href="/dashboard/admin/internships"
            className="mt-3 inline-block text-sm text-emerald-700 hover:underline"
          >
            View all internships →
          </Link>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="font-semibold text-slate-900">Recent Payments</h2>
        <Card className="mt-4 divide-y divide-slate-100">
          {payments.map((p) => (
            <div key={p.id} className="flex justify-between p-4 text-sm">
              <span>{formatCurrency(p.amount)}</span>
              <span className="text-slate-500">{p.purpose.replace(/_/g, " ")}</span>
              <span className="text-slate-400">{p.createdAt.toLocaleDateString()}</span>
            </div>
          ))}
          {payments.length === 0 && (
            <p className="p-6 text-center text-sm text-slate-500">No payments yet</p>
          )}
        </Card>
      </section>

      <p className="mt-6 text-sm text-slate-500">Total service orders: {orderCount}</p>
    </AdminShell>
  );
}
