import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyApplicationStatus } from "@/lib/notifications";

const validStatuses = ["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED", "ACCEPTED"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const application = await prisma.internshipApplication.findUnique({
    where: { id },
    include: {
      internship: true,
      student: { select: { email: true, name: true } },
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    session.user.role !== "ADMIN" &&
    application.internship.providerId !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.internshipApplication.update({
    where: { id },
    data: { status },
  });

  if (status !== "PENDING") {
    notifyApplicationStatus(
      application.studentId,
      application.student.email,
      application.internship.title,
      status
    ).catch(console.error);
  }

  return NextResponse.json({ success: true });
}
