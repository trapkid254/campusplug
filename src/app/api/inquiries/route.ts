import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { notifyInquiry } from "@/lib/notifications";

const schema = z.object({
  propertyId: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(9),
  message: z.string().min(10),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
      include: { landlord: { select: { id: true, email: true } } },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    await prisma.inquiry.create({ data });

    if (property.landlord) {
      notifyInquiry(property.landlord.id, property.landlord.email, property.title, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
      }).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid inquiry data" }, { status: 400 });
  }
}
