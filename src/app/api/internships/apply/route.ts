import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyApplication } from "@/lib/notifications";

const schema = z.object({
  internshipId: z.string(),
  coverLetter: z.string().min(50),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.internshipApplication.findUnique({
      where: {
        internshipId_studentId: {
          internshipId: data.internshipId,
          studentId: session.user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "You already applied" }, { status: 400 });
    }

    const internship = await prisma.internship.findUnique({
      where: { id: data.internshipId },
      include: { provider: { select: { id: true, email: true } } },
    });

    if (!internship) {
      return NextResponse.json({ error: "Internship not found" }, { status: 404 });
    }

    await prisma.internshipApplication.create({
      data: {
        internshipId: data.internshipId,
        studentId: session.user.id,
        coverLetter: data.coverLetter,
      },
    });

    notifyApplication(
      internship.provider.id,
      internship.provider.email,
      internship.title,
      session.user.name || "A student"
    ).catch(console.error);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Application failed" }, { status: 400 });
  }
}
