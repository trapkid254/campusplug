import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { notifyWelcome } from "@/lib/notifications";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(9),
  role: z.enum(["STUDENT", "LANDLORD", "INTERNSHIP_PROVIDER"]),
  companyName: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(data.password, 12);

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
        phone: data.phone,
        role: data.role,
        companyName: data.companyName,
      },
    });

    notifyWelcome(data.email, data.name, data.phone).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
