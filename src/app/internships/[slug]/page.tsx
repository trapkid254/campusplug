import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { MapPin, Clock, Building2 } from "lucide-react";
import { notFound } from "next/navigation";
import { InternshipApplicationForm } from "@/components/internships/InternshipApplicationForm";
import { INTERNSHIP_CATEGORIES } from "@/lib/utils";

export default async function InternshipDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const internship = await prisma.internship.findUnique({
    where: { slug, status: "APPROVED" },
    include: { provider: { select: { name: true, companyName: true, companyBio: true } } },
  });

  if (!internship) notFound();

  const categoryLabel =
    INTERNSHIP_CATEGORIES.find((c) => c.value === internship.category)?.label ||
    internship.category;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-2">
        <Badge variant="info">{categoryLabel}</Badge>
        {internship.paid && <Badge variant="success">Paid</Badge>}
        <Badge>{internship.workMode}</Badge>
      </div>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">{internship.title}</h1>
      <p className="mt-2 flex items-center gap-2 text-lg text-slate-600">
        <Building2 className="h-5 w-5" />
        {internship.companyName}
      </p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4" /> {internship.location}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          Apply by {format(internship.applicationDeadline, "dd MMMM yyyy")}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="font-semibold text-slate-900">About the Role</h2>
            <p className="mt-3 whitespace-pre-line text-slate-600 leading-relaxed">
              {internship.description}
            </p>
          </Card>
          <Card className="p-6">
            <h2 className="font-semibold text-slate-900">Requirements</h2>
            <p className="mt-3 whitespace-pre-line text-slate-600">{internship.requirements}</p>
          </Card>
          <Card className="p-6">
            <h2 className="font-semibold text-slate-900">How to Apply</h2>
            <p className="mt-3 text-slate-600">{internship.applicationInstructions}</p>
          </Card>
        </div>
        <div>
          <Card className="sticky top-24 p-6">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Duration</dt>
                <dd className="font-medium">{internship.duration}</dd>
              </div>
              {internship.stipend && (
                <div>
                  <dt className="text-slate-500">Stipend</dt>
                  <dd className="font-medium text-emerald-700">{internship.stipend}</dd>
                </div>
              )}
            </dl>
            <div className="mt-6">
              <InternshipApplicationForm internshipId={internship.id} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
