import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PropertyForm } from "@/components/properties/PropertyForm";
import { DeletePropertyButton } from "@/components/properties/DeletePropertyButton";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth(["LANDLORD", "ADMIN"]);
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });

  if (!property) notFound();
  if (session.user.role !== "ADMIN" && property.landlordId !== session.user.id) {
    notFound();
  }

  const universities = await prisma.university.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/dashboard/landlord" className="text-sm text-emerald-700 hover:underline">
        ← Back to dashboard
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Property</h1>
          <p className="text-slate-600">{property.title}</p>
        </div>
        <DeletePropertyButton propertyId={property.id} />
      </div>
      <div className="mt-8">
        <PropertyForm
          universities={universities}
          initial={{
            id: property.id,
            title: property.title,
            propertyType: property.propertyType,
            description: property.description,
            location: property.location,
            latitude: property.latitude,
            longitude: property.longitude,
            monthlyRent: property.monthlyRent,
            depositAmount: property.depositAmount,
            furnished: property.furnished,
            genderSpecific: property.genderSpecific,
            amenities: property.amenities,
            availability: property.availability,
            contactPhone: property.contactPhone,
            whatsappNumber: property.whatsappNumber,
            universityId: property.universityId,
            images: property.images,
          }}
        />
      </div>
    </div>
  );
}
