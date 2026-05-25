import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function LandlordDashboard() {
  const session = await requireAuth(["LANDLORD", "ADMIN"]);

  const properties = await prisma.property.findMany({
    where: { landlordId: session.user.id },
    include: { images: { take: 1 }, _count: { select: { inquiries: true } } },
    orderBy: { createdAt: "desc" },
  });

  const subscription = await prisma.subscription.findFirst({
    where: { userId: session.user.id, active: true, expiresAt: { gt: new Date() } },
    include: { plan: true },
  });

  const totalViews = properties.reduce((s, p) => s + p.views, 0);
  const totalInquiries = properties.reduce((s, p) => s + p._count.inquiries, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Landlord Dashboard</h1>
          <p className="text-slate-600">Manage your property listings</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/landlord/inquiries"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View Inquiries
          </Link>
          <Link
            href="/dashboard/landlord/subscription"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
          >
            Subscription
          </Link>
          <Link
            href="/dashboard/landlord/new"
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            + Add Listing
          </Link>
        </div>
      </div>

      {subscription && (
        <Card className="mt-6 border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-800">
            Active plan: {subscription.plan.name} · expires{" "}
            {subscription.expiresAt.toLocaleDateString()}
          </p>
        </Card>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Listings</p>
          <p className="text-2xl font-bold">{properties.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Total Views</p>
          <p className="text-2xl font-bold">{totalViews}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Inquiries</p>
          <p className="text-2xl font-bold">{totalInquiries}</p>
        </Card>
      </div>

      <div className="mt-8 space-y-4">
        {properties.map((p) => (
          <Card key={p.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{p.title}</p>
              <p className="text-sm text-slate-500">
                {formatCurrency(p.monthlyRent)}/mo · {p.views} views · {p._count.inquiries}{" "}
                inquiries
              </p>
              {p.status === "APPROVED" && (
                <Link
                  href={`/properties/${p.slug}`}
                  className="text-xs text-emerald-700 hover:underline"
                >
                  View live listing →
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  p.status === "APPROVED" ? "success" : p.status === "PENDING" ? "warning" : "danger"
                }
              >
                {p.status}
              </Badge>
              <Link
                href={`/dashboard/landlord/${p.id}/edit`}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
              >
                Edit
              </Link>
            </div>
          </Card>
        ))}
        {properties.length === 0 && (
          <Card className="p-12 text-center text-slate-500">
            No listings yet. Add your first property to get started.
          </Card>
        )}
      </div>
    </div>
  );
}
