import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { ServiceOrderForm } from "@/components/services/ServiceOrderForm";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await prisma.academicService.findUnique({ where: { slug, active: true } });
  if (!service) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">{service.title}</h1>
      <p className="mt-4 text-lg text-emerald-700 font-semibold">
        From {formatCurrency(service.priceFrom)}
        {service.priceTo && ` – ${formatCurrency(service.priceTo)}`}
      </p>
      <Card className="mt-8 p-6">
        <p className="text-slate-600 leading-relaxed whitespace-pre-line">{service.description}</p>
        <p className="mt-4 text-sm text-slate-500">Estimated delivery: {service.deliveryDays} days</p>
      </Card>
      <Card className="mt-6 p-6">
        <h2 className="font-semibold text-slate-900">Request This Service</h2>
        <ServiceOrderForm serviceId={service.id} serviceTitle={service.title} />
      </Card>
    </div>
  );
}
