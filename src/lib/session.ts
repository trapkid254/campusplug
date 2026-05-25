import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";

export async function requireAuth(allowedRoles?: UserRole[]) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    redirect("/dashboard");
  }
  return session;
}

export async function getSession() {
  return auth();
}
