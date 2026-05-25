import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { InternshipForm } from "@/components/internships/InternshipForm";
import { DeleteInternshipButton } from "@/components/internships/DeleteInternshipButton";

export default async function EditInternshipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth(["INTERNSHIP_PROVIDER", "ADMIN"]);
  const { id } = await params;

  const internship = await prisma.internship.findUnique({ where: { id } });
  if (!internship) notFound();
  if (session.user.role !== "ADMIN" && internship.providerId !== session.user.id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/dashboard/provider" className="text-sm text-emerald-700 hover:underline">
        ← Back to dashboard
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Internship</h1>
          <p className="text-slate-600">{internship.title}</p>
        </div>
        <DeleteInternshipButton internshipId={internship.id} />
      </div>
      <div className="mt-8">
        <InternshipForm initial={internship} companyName={internship.companyName} />
      </div>
    </div>
  );
}
