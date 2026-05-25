import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { formatCurrency, SERVICE_CATEGORIES } from "@/lib/utils";

export default async function ServicesPage() {
  const services = await prisma.academicService.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { title: "asc" }],
  });

  const categoryLabels = Object.fromEntries(
    SERVICE_CATEGORIES.map((c) => [c.value, c.label])
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Academic Support Services</h1>
      <p className="mt-2 text-slate-600">
        Research assistance, data analysis, CV writing, and more from trusted consultants
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link key={service.id} href={`/services/${service.slug}`}>
            <Card hover className="h-full p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-600">
                {categoryLabels[service.category] || service.category}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">{service.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{service.description}</p>
              <p className="mt-4 font-semibold text-emerald-700">
                From {formatCurrency(service.priceFrom)}
                {service.priceTo && ` – ${formatCurrency(service.priceTo)}`}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Delivery: {service.deliveryDays} days
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
