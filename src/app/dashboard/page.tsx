import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDashboardPath } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect(getDashboardPath(session.user.role));
}
