import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PropertyForm } from "@/components/properties/PropertyForm";
import Link from "next/link";

export default async function NewPropertyPage() {
  await requireAuth(["LANDLORD", "ADMIN"]);
  const universities = await prisma.university.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/dashboard/landlord" className="text-sm text-emerald-700 hover:underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Add New Property</h1>
      <p className="mt-1 text-slate-600">List a hostel, bedsitter, or rental near campus</p>
      <div className="mt-8">
        <PropertyForm universities={universities} />
      </div>
    </div>
  );
}
