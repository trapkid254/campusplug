import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  formatCurrency,
  parseAmenities,
  whatsappLink,
  PROPERTY_TYPES,
} from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MapPin, Phone, MessageCircle, Shield, Calendar } from "lucide-react";
import { format } from "date-fns";
import { PropertyInquiryForm } from "@/components/properties/PropertyInquiryForm";
import { FavoriteButton } from "@/components/properties/FavoriteButton";
import { auth } from "@/lib/auth";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const property = await prisma.property.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      images: { orderBy: { order: "asc" } },
      university: true,
      landlord: { select: { name: true, phone: true, verified: true } },
    },
  });

  if (!property) notFound();

  const favorite = session?.user
    ? await prisma.favorite.findUnique({
        where: {
          userId_propertyId: { userId: session.user.id, propertyId: property.id },
        },
      })
    : null;

  await prisma.property.update({
    where: { id: property.id },
    data: { views: { increment: 1 } },
  });

  const amenities = parseAmenities(property.amenities);
  const typeLabel =
    PROPERTY_TYPES.find((t) => t.value === property.propertyType)?.label ||
    property.propertyType;
  const waPhone = property.whatsappNumber || property.contactPhone;
  const waMessage = `Hi, I'm interested in "${property.title}" on CampusPlug (${formatCurrency(property.monthlyRent)}/month).`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-2 sm:grid-cols-2">
            {(property.images.length > 0
              ? property.images
              : [{ url: "https://images.unsplash.com/photo-1555854877-0b40670a0b0e?w=800&h=600&fit=crop", alt: property.title }]
            ).map((img, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-2xl ${i === 0 && property.images.length > 1 ? "sm:col-span-2 sm:row-span-2 aspect-[16/9]" : "aspect-[4/3]"}`}
              >
                <Image
                  src={img.url}
                  alt={img.alt || property.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="info">{typeLabel}</Badge>
              {property.verified && (
                <Badge variant="success">
                  <Shield className="mr-1 h-3 w-3" /> Verified
                </Badge>
              )}
              {property.featured && <Badge variant="warning">Featured</Badge>}
            </div>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-slate-900">{property.title}</h1>
              <FavoriteButton propertyId={property.id} initialFavorited={!!favorite} />
            </div>
            <p className="mt-2 flex items-center gap-2 text-slate-600">
              <MapPin className="h-5 w-5 text-emerald-600" />
              {property.location}
              {property.university && ` · Near ${property.university.name}`}
            </p>
          </div>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900">Description</h2>
            <p className="mt-3 whitespace-pre-line text-slate-600 leading-relaxed">
              {property.description}
            </p>
          </Card>

          {amenities.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900">Amenities</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {a}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {property.latitude && property.longitude && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900">Location</h2>
              <a
                href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block overflow-hidden rounded-xl"
              >
                <iframe
                  title="Property location"
                  className="h-64 w-full border-0"
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`}
                />
              </a>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24 p-6">
            <p className="text-3xl font-bold text-emerald-700">
              {formatCurrency(property.monthlyRent)}
              <span className="text-base font-normal text-slate-500">/month</span>
            </p>
            {property.depositAmount > 0 && (
              <p className="mt-1 text-sm text-slate-500">
                Deposit: {formatCurrency(property.depositAmount)}
              </p>
            )}
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Availability</dt>
                <dd className="font-medium capitalize">{property.availability.toLowerCase().replace("_", " ")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Furnished</dt>
                <dd className="font-medium">{property.furnished ? "Yes" : "No"}</dd>
              </div>
              {property.genderSpecific && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Gender</dt>
                  <dd className="font-medium">{property.genderSpecific}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-slate-500">Posted</dt>
                <dd className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(property.createdAt, "dd MMM yyyy")}
                </dd>
              </div>
            </dl>

            <div className="mt-6 space-y-3">
              <a href={`tel:${property.contactPhone}`} className="block">
                <Button variant="outline" className="w-full">
                  <Phone className="h-4 w-4" />
                  Call {property.contactPhone}
                </Button>
              </a>
              <a
                href={whatsappLink(waPhone, waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="whatsapp" className="w-full">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Landlord
                </Button>
              </a>
            </div>

            {property.landlord && (
              <div className="mt-6 border-t border-slate-100 pt-6">
                <p className="text-sm text-slate-500">Listed by</p>
                <p className="font-semibold text-slate-900">{property.landlord.name}</p>
                {property.landlord.verified && (
                  <Badge variant="success" className="mt-2">Verified Agent</Badge>
                )}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-slate-900">Send Inquiry</h2>
            <PropertyInquiryForm propertyId={property.id} />
          </Card>
        </div>
      </div>
    </div>
  );
}
