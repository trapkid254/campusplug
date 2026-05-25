import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/dashboard/AdminShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { PropertyModerationButtons } from "@/components/admin/ModerationButtons";
import Link from "next/link";

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAuth(["ADMIN"]);
  const { status } = await searchParams;

  const properties = await prisma.property.findMany({
    where: status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : undefined,
    include: { landlord: { select: { name: true, email: true } }, university: true },
    orderBy: { createdAt: "desc" },
  });

  const counts = {
    all: await prisma.property.count(),
    pending: await prisma.property.count({ where: { status: "PENDING" } }),
    approved: await prisma.property.count({ where: { status: "APPROVED" } }),
    rejected: await prisma.property.count({ where: { status: "REJECTED" } }),
  };

  return (
    <AdminShell title="Property Moderation" description="Review and manage all listings">
      <div className="flex flex-wrap gap-2">
        {[
          { label: "All", value: "", count: counts.all },
          { label: "Pending", value: "PENDING", count: counts.pending },
          { label: "Approved", value: "APPROVED", count: counts.approved },
          { label: "Rejected", value: "REJECTED", count: counts.rejected },
        ].map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/dashboard/admin/properties?status=${tab.value}` : "/dashboard/admin/properties"}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              (status || "") === tab.value
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label} ({tab.count})
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {properties.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      p.status === "APPROVED"
                        ? "success"
                        : p.status === "PENDING"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {p.status}
                  </Badge>
                  {p.featured && <Badge variant="warning">Featured</Badge>}
                  {p.verified && <Badge variant="success">Verified</Badge>}
                </div>
                <p className="mt-2 font-semibold text-slate-900">{p.title}</p>
                <p className="text-sm text-slate-500">
                  {formatCurrency(p.monthlyRent)}/mo · {p.location}
                  {p.university && ` · ${p.university.name}`}
                </p>
                <p className="text-xs text-slate-400">
                  By {p.landlord?.name || "—"} ({p.landlord?.email || "admin"}) · {p.views} views
                </p>
                {p.status === "APPROVED" && (
                  <Link
                    href={`/properties/${p.slug}`}
                    className="text-xs text-emerald-700 hover:underline"
                  >
                    View listing →
                  </Link>
                )}
              </div>
              <PropertyModerationButtons
                id={p.id}
                status={p.status}
                featured={p.featured}
              />
            </div>
          </Card>
        ))}
        {properties.length === 0 && (
          <Card className="p-12 text-center text-slate-500">No properties in this category.</Card>
        )}
      </div>
    </AdminShell>
  );
}
