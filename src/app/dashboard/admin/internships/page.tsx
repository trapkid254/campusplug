import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/dashboard/AdminShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { InternshipModerationButtons } from "@/components/admin/ModerationButtons";
import Link from "next/link";
import { format } from "date-fns";

export default async function AdminInternshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAuth(["ADMIN"]);
  const { status } = await searchParams;

  const internships = await prisma.internship.findMany({
    where: status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" | "CLOSED" } : undefined,
    include: {
      provider: { select: { name: true, email: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const counts = {
    all: await prisma.internship.count(),
    pending: await prisma.internship.count({ where: { status: "PENDING" } }),
    approved: await prisma.internship.count({ where: { status: "APPROVED" } }),
  };

  return (
    <AdminShell title="Internship Moderation" description="Review and manage job postings">
      <div className="flex flex-wrap gap-2">
        {[
          { label: "All", value: "", count: counts.all },
          { label: "Pending", value: "PENDING", count: counts.pending },
          { label: "Approved", value: "APPROVED", count: counts.approved },
        ].map((tab) => (
          <Link
            key={tab.label}
            href={
              tab.value
                ? `/dashboard/admin/internships?status=${tab.value}`
                : "/dashboard/admin/internships"
            }
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
        {internships.map((i) => (
          <Card key={i.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      i.status === "APPROVED"
                        ? "success"
                        : i.status === "PENDING"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {i.status}
                  </Badge>
                  {i.featured && <Badge variant="warning">Featured</Badge>}
                  {i.paid && <Badge variant="success">Paid</Badge>}
                </div>
                <p className="mt-2 font-semibold">{i.title}</p>
                <p className="text-sm text-slate-500">
                  {i.companyName} · {i.location} · Deadline:{" "}
                  {format(i.applicationDeadline, "dd MMM yyyy")}
                </p>
                <p className="text-xs text-slate-400">
                  Provider: {i.provider.name} · {i._count.applications} applications · {i.views}{" "}
                  views
                </p>
              </div>
              <InternshipModerationButtons
                id={i.id}
                status={i.status}
                featured={i.featured}
              />
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
