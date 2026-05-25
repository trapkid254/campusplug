import { prisma } from "@/lib/prisma";
import { InternshipCard } from "@/components/internships/InternshipCard";
import { Card } from "@/components/ui/Card";
import { Briefcase } from "lucide-react";
import { INTERNSHIP_CATEGORIES } from "@/lib/utils";
import type { Prisma, InternshipCategory, WorkMode } from "@prisma/client";

export default async function InternshipsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    paid?: string;
    workMode?: string;
    location?: string;
  }>;
}) {
  const params = await searchParams;
  const where: Prisma.InternshipWhereInput = { status: "APPROVED" };

  if (params.q) {
    where.OR = [
      { title: { contains: params.q } },
      { companyName: { contains: params.q } },
      { description: { contains: params.q } },
    ];
  }
  if (params.category) where.category = params.category as InternshipCategory;
  if (params.paid === "true") where.paid = true;
  if (params.paid === "false") where.paid = false;
  if (params.workMode) where.workMode = params.workMode as WorkMode;
  if (params.location) where.location = { contains: params.location };

  const internships = await prisma.internship.findMany({
    where,
    orderBy: [{ featured: "desc" }, { applicationDeadline: "asc" }],
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Internships & Attachments</h1>
      <p className="mt-2 text-slate-600">
        Industrial attachments, graduate trainee programs & student jobs in Kenya
      </p>

      <Card className="mt-8 p-5">
        <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search title or company..."
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm lg:col-span-2"
          />
          <select name="category" defaultValue={params.category || ""} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="">All Categories</option>
            {INTERNSHIP_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select name="paid" defaultValue={params.paid || ""} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="">Paid/Unpaid</option>
            <option value="true">Paid</option>
            <option value="false">Unpaid</option>
          </select>
          <select name="workMode" defaultValue={params.workMode || ""} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="">Work Mode</option>
            <option value="REMOTE">Remote</option>
            <option value="ONSITE">On-site</option>
            <option value="HYBRID">Hybrid</option>
          </select>
          <button type="submit" className="rounded-xl bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            Search
          </button>
        </form>
      </Card>

      <p className="mt-6 text-sm text-slate-500">{internships.length} opportunities</p>
      {internships.length > 0 ? (
        <div className="mt-4 grid gap-4">
          {internships.map((i) => (
            <InternshipCard key={i.id} internship={i} />
          ))}
        </div>
      ) : (
        <Card className="mt-8 p-16 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-500">No internships found.</p>
        </Card>
      )}
    </div>
  );
}
