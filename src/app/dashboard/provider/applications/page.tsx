import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { format } from "date-fns";
import { ApplicationStatusSelect } from "@/components/admin/ApplicationStatusSelect";

export default async function ProviderApplicationsPage() {
  const session = await requireAuth(["INTERNSHIP_PROVIDER", "ADMIN"]);

  const applications = await prisma.internshipApplication.findMany({
    where: {
      internship: { providerId: session.user.id },
    },
    include: {
      internship: { select: { title: true, slug: true } },
      student: { select: { name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/dashboard/provider" className="text-sm text-emerald-700 hover:underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Applications</h1>
      <p className="text-slate-600">{applications.length} total applications</p>

      <div className="mt-8 space-y-4">
        {applications.map((app) => (
          <Card key={app.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{app.student.name}</p>
                <Link
                  href={`/internships/${app.internship.slug}`}
                  className="text-sm text-emerald-700 hover:underline"
                >
                  {app.internship.title}
                </Link>
              </div>
              <ApplicationStatusSelect applicationId={app.id} currentStatus={app.status} />
            </div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd>{app.student.email}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Phone</dt>
                <dd>{app.student.phone || "—"}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-slate-400">
              Applied {format(app.createdAt, "dd MMM yyyy")}
            </p>
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium text-emerald-700">
                View cover letter
              </summary>
              <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-line">
                {app.coverLetter}
              </p>
            </details>
          </Card>
        ))}
        {applications.length === 0 && (
          <Card className="p-12 text-center text-slate-500">No applications yet.</Card>
        )}
      </div>
    </div>
  );
}
