import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { propertyId } = await req.json();
  if (!propertyId) {
    return NextResponse.json({ error: "Property ID required" }, { status: 400 });
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_propertyId: {
        userId: session.user.id,
        propertyId,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({
    data: { userId: session.user.id, propertyId },
  });

  return NextResponse.json({ favorited: true });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { propertyId: true },
  });

  return NextResponse.json({ propertyIds: favorites.map((f) => f.propertyId) });
}
