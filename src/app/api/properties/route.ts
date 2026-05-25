import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { propertySchema } from "@/lib/validations";
import { slugify, stringifyAmenities } from "@/lib/utils";

async function uniqueSlug(title: string): Promise<string> {
  let slug = slugify(title);
  let counter = 0;
  while (await prisma.property.findUnique({ where: { slug } })) {
    counter++;
    slug = `${slugify(title)}-${counter}`;
  }
  return slug;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !["LANDLORD", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = propertySchema.parse({
      ...body,
      monthlyRent: Number(body.monthlyRent),
      depositAmount: Number(body.depositAmount || 0),
      furnished: body.furnished === true || body.furnished === "true",
      latitude: body.latitude ? Number(body.latitude) : null,
      longitude: body.longitude ? Number(body.longitude) : null,
      amenities: Array.isArray(body.amenities)
        ? body.amenities
        : typeof body.amenities === "string"
          ? body.amenities.split(",").map((a: string) => a.trim()).filter(Boolean)
          : [],
      imageUrls: Array.isArray(body.imageUrls)
        ? body.imageUrls.filter(Boolean)
        : body.imageUrls
          ? [body.imageUrls]
          : [],
    });

    const slug = await uniqueSlug(data.title);

    const property = await prisma.property.create({
      data: {
        title: data.title,
        slug,
        propertyType: data.propertyType,
        description: data.description,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        monthlyRent: data.monthlyRent,
        depositAmount: data.depositAmount,
        furnished: data.furnished,
        genderSpecific: data.genderSpecific || null,
        amenities: stringifyAmenities(data.amenities),
        availability: data.availability,
        contactPhone: data.contactPhone,
        whatsappNumber: data.whatsappNumber || data.contactPhone,
        universityId: data.universityId || null,
        landlordId: session.user.id,
        status: session.user.role === "ADMIN" ? "APPROVED" : "PENDING",
        images: {
          create: data.imageUrls.map((url, i) => ({ url, order: i })),
        },
      },
    });

    return NextResponse.json({ success: true, propertyId: property.id, slug: property.slug });
  } catch (err) {
    console.error(err);
    if (err && typeof err === "object" && "issues" in err) {
      const issues = (err as { issues: { message: string }[] }).issues;
      return NextResponse.json(
        { error: issues.map((i) => i.message).join(". ") },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
