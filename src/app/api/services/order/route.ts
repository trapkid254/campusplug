import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyOrderAdmin } from "@/lib/notifications";

const schema = z.object({
  serviceId: z.string(),
  title: z.string().min(3),
  description: z.string().min(20),
  budget: z.number().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const service = await prisma.academicService.findUnique({
      where: { id: data.serviceId },
    });

    const order = await prisma.serviceOrder.create({
      data: {
        serviceId: data.serviceId,
        studentId: session.user.id,
        title: data.title,
        description: data.description,
        budget: data.budget,
      },
    });

    notifyOrderAdmin({
      title: data.title,
      studentName: session.user.name || "Student",
      serviceName: service?.title || "Academic Service",
    }).catch(console.error);

    return NextResponse.json({ success: true, orderId: order.id });
  } catch {
    return NextResponse.json({ error: "Order failed" }, { status: 400 });
  }
}
