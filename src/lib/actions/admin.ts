"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notifyListingApproved } from "@/lib/notifications";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function moderateProperty(
  id: string,
  action: "approve" | "reject" | "feature" | "unfeature" | "verify"
) {
  await requireAdmin();

  const data: Record<string, unknown> = {};
  switch (action) {
    case "approve":
      data.status = "APPROVED";
      break;
    case "reject":
      data.status = "REJECTED";
      break;
    case "feature":
      data.featured = true;
      break;
    case "unfeature":
      data.featured = false;
      break;
    case "verify":
      data.verified = true;
      break;
  }

  const property = await prisma.property.update({
    where: { id },
    data,
    include: { landlord: { select: { email: true } } },
  });

  if (action === "approve" && property.landlord) {
    notifyListingApproved(
      property.landlordId!,
      property.landlord.email,
      property.title,
      property.slug
    ).catch(console.error);
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/properties");
  revalidatePath("/properties");
}

export async function moderateInternship(
  id: string,
  action: "approve" | "reject" | "feature" | "unfeature" | "close"
) {
  await requireAdmin();

  const data: Record<string, unknown> = {};
  switch (action) {
    case "approve":
      data.status = "APPROVED";
      break;
    case "reject":
      data.status = "REJECTED";
      break;
    case "close":
      data.status = "CLOSED";
      break;
    case "feature":
      data.featured = true;
      break;
    case "unfeature":
      data.featured = false;
      break;
  }

  await prisma.internship.update({ where: { id }, data });
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/internships");
  revalidatePath("/internships");
}

export async function toggleUserVerified(userId: string) {
  await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  await prisma.user.update({
    where: { id: userId },
    data: { verified: !user.verified },
  });
  revalidatePath("/dashboard/admin/users");
}

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin();
  const valid = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
  if (!valid.includes(status)) throw new Error("Invalid status");

  await prisma.serviceOrder.update({
    where: { id: orderId },
    data: { status: status as "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" },
  });
  revalidatePath("/dashboard/admin/orders");
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role === "ADMIN") throw new Error("Cannot delete this user");
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/dashboard/admin/users");
}
