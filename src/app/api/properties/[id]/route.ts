import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { propertySchema } from "@/lib/validations";
import { stringifyAmenities } from "@/lib/utils";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.property.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    session.user.role !== "ADMIN" &&
    existing.landlordId !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = propertySchema.partial().parse({
      ...body,
      monthlyRent: body.monthlyRent ? Number(body.monthlyRent) : undefined,
      depositAmount: body.depositAmount !== undefined ? Number(body.depositAmount) : undefined,
      furnished:
        body.furnished !== undefined
          ? body.furnished === true || body.furnished === "true"
          : undefined,
      latitude: body.latitude ? Number(body.latitude) : undefined,
      longitude: body.longitude ? Number(body.longitude) : undefined,
      amenities: body.amenities
        ? Array.isArray(body.amenities)
          ? body.amenities
          : body.amenities.split(",").map((a: string) => a.trim()).filter(Boolean)
        : undefined,
    });

    const imageUrls: string[] | undefined = body.imageUrls
      ? Array.isArray(body.imageUrls)
        ? body.imageUrls.filter(Boolean)
        : [body.imageUrls]
      : undefined;

    await prisma.$transaction(async (tx) => {
      if (imageUrls) {
        await tx.propertyImage.deleteMany({ where: { propertyId: id } });
        if (imageUrls.length > 0) {
          await tx.propertyImage.createMany({
            data: imageUrls.map((url, i) => ({ propertyId: id, url, order: i })),
          });
        }
      }

      await tx.property.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.propertyType && { propertyType: data.propertyType }),
          ...(data.description && { description: data.description }),
          ...(data.location && { location: data.location }),
          ...(data.latitude !== undefined && { latitude: data.latitude }),
          ...(data.longitude !== undefined && { longitude: data.longitude }),
          ...(data.monthlyRent && { monthlyRent: data.monthlyRent }),
          ...(data.depositAmount !== undefined && { depositAmount: data.depositAmount }),
          ...(data.furnished !== undefined && { furnished: data.furnished }),
          ...(data.genderSpecific !== undefined && { genderSpecific: data.genderSpecific }),
          ...(data.amenities && { amenities: stringifyAmenities(data.amenities) }),
          ...(data.availability && { availability: data.availability }),
          ...(data.contactPhone && { contactPhone: data.contactPhone }),
          ...(data.whatsappNumber !== undefined && { whatsappNumber: data.whatsappNumber }),
          ...(data.universityId !== undefined && { universityId: data.universityId }),
          status: session.user.role === "ADMIN" ? existing.status : "PENDING",
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.property.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session.user.role !== "ADMIN" && existing.landlordId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.property.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
