import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { format } from "date-fns";

export default async function ProviderDashboard() {
  const session = await requireAuth(["INTERNSHIP_PROVIDER", "ADMIN"]);

  const internships = await prisma.internship.findMany({
    where: { providerId: session.user.id },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalApplications = internships.reduce((s, i) => s + i._count.applications, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Provider Dashboard</h1>
          <p className="text-slate-600">{session.user.name}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/provider/applications"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View Applications ({totalApplications})
          </Link>
          <Link
            href="/dashboard/provider/new"
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            + Post Internship
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Active Postings</p>
          <p className="text-2xl font-bold">
            {internships.filter((i) => i.status === "APPROVED").length}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Total Applications</p>
          <p className="text-2xl font-bold">{totalApplications}</p>
        </Card>
      </div>

      <div className="mt-8 space-y-4">
        {internships.map((i) => (
          <Card key={i.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{i.title}</p>
                <p className="text-sm text-slate-500">
                  Deadline: {format(i.applicationDeadline, "dd MMM yyyy")} ·{" "}
                  {i._count.applications} applications · {i.views} views
                </p>
                {i.status === "APPROVED" && (
                  <Link
                    href={`/internships/${i.slug}`}
                    className="text-xs text-emerald-700 hover:underline"
                  >
                    View live posting →
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={i.status === "APPROVED" ? "success" : "warning"}>{i.status}</Badge>
                <Link
                  href={`/dashboard/provider/${i.id}/edit`}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                >
                  Edit
                </Link>
              </div>
            </div>
          </Card>
        ))}
        {internships.length === 0 && (
          <Card className="p-12 text-center text-slate-500">No internships posted yet.</Card>
        )}
      </div>
    </div>
  );
}
