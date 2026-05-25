import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DashboardShell, DashboardNav } from "@/components/dashboard/DashboardShell";
import Link from "next/link";
import { format } from "date-fns";

const nav = [
  { href: "/dashboard/student", label: "Overview" },
  { href: "/dashboard/student/applications", label: "My Applications" },
  { href: "/dashboard/student/orders", label: "Service Orders" },
  { href: "/dashboard/student/favorites", label: "Saved Properties" },
];

export default async function StudentApplicationsPage() {
  const session = await requireAuth(["STUDENT"]);

  const applications = await prisma.internshipApplication.findMany({
    where: { studentId: session.user.id },
    include: { internship: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell title="My Applications" nav={<DashboardNav links={nav} />}>
      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app.id} className="p-5">
            <div className="flex justify-between gap-4">
              <div>
                <Link
                  href={`/internships/${app.internship.slug}`}
                  className="font-semibold text-slate-900 hover:text-emerald-700"
                >
                  {app.internship.title}
                </Link>
                <p className="text-sm text-slate-500">{app.internship.companyName}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Applied {format(app.createdAt, "dd MMM yyyy")}
                </p>
              </div>
              <Badge variant={app.status === "PENDING" ? "warning" : "info"}>{app.status}</Badge>
            </div>
          </Card>
        ))}
        {applications.length === 0 && (
          <Card className="p-8 text-center text-slate-500">
            <p>No applications yet.</p>
            <Link href="/internships" className="mt-4 inline-block text-emerald-700 hover:underline">
              Browse internships →
            </Link>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
