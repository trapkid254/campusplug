import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";

export default async function LandlordInquiriesPage() {
  const session = await requireAuth(["LANDLORD", "ADMIN"]);

  const inquiries = await prisma.inquiry.findMany({
    where: {
      property: { landlordId: session.user.id },
    },
    include: {
      property: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/dashboard/landlord" className="text-sm text-emerald-700 hover:underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Property Inquiries</h1>
      <p className="text-slate-600">{inquiries.length} total inquiries</p>

      <div className="mt-8 space-y-4">
        {inquiries.map((inq) => (
          <Card key={inq.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Link
                  href={`/properties/${inq.property.slug}`}
                  className="font-semibold text-emerald-700 hover:underline"
                >
                  {inq.property.title}
                </Link>
                <p className="mt-1 text-sm text-slate-500">
                  {format(inq.createdAt, "dd MMM yyyy, HH:mm")}
                </p>
              </div>
            </div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">From</dt>
                <dd className="font-medium">{inq.name}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Phone</dt>
                <dd>
                  <a href={`tel:${inq.phone}`} className="text-emerald-700">
                    {inq.phone}
                  </a>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Email</dt>
                <dd>{inq.email}</dd>
              </div>
            </dl>
            <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{inq.message}</p>
            <div className="mt-3 flex gap-2">
              <a
                href={`https://wa.me/254${inq.phone.replace(/\D/g, "").replace(/^0/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-emerald-700 hover:underline"
              >
                Reply on WhatsApp →
              </a>
            </div>
          </Card>
        ))}
        {inquiries.length === 0 && (
          <Card className="p-12 text-center text-slate-500">No inquiries yet.</Card>
        )}
      </div>
    </div>
  );
}
