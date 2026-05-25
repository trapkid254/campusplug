import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { InternshipForm } from "@/components/internships/InternshipForm";
import Link from "next/link";

export default async function NewInternshipPage() {
  const session = await requireAuth(["INTERNSHIP_PROVIDER", "ADMIN"]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/dashboard/provider" className="text-sm text-emerald-700 hover:underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Post Internship</h1>
      <p className="mt-1 text-slate-600">Create a new opportunity for Kenyan students</p>
      <div className="mt-8">
        <InternshipForm companyName={session.user.name} />
      </div>
    </div>
  );
}
