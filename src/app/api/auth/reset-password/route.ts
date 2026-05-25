import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const { token, password } = schema.parse(await req.json());

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashed },
      }),
      prisma.passwordResetToken.delete({ where: { id: resetToken.id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Reset failed" }, { status: 400 });
  }
}
