import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(3),
  message: z.string().min(10),
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    await prisma.contactMessage.create({ data });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }
}
