import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { internshipSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

async function uniqueSlug(title: string, company: string): Promise<string> {
  let slug = slugify(`${title}-${company}`);
  let counter = 0;
  while (await prisma.internship.findUnique({ where: { slug } })) {
    counter++;
    slug = `${slugify(`${title}-${company}`)}-${counter}`;
  }
  return slug;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !["INTERNSHIP_PROVIDER", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = internshipSchema.parse({
      ...body,
      paid: body.paid === true || body.paid === "true",
    });

    const slug = await uniqueSlug(data.title, data.companyName);

    const internship = await prisma.internship.create({
      data: {
        ...data,
        slug,
        applicationDeadline: new Date(data.applicationDeadline),
        providerId: session.user.id,
        status: session.user.role === "ADMIN" ? "APPROVED" : "PENDING",
      },
    });

    return NextResponse.json({ success: true, internshipId: internship.id, slug });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create internship" }, { status: 400 });
  }
}
