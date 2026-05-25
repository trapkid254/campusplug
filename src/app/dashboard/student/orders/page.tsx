import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DashboardShell, DashboardNav } from "@/components/dashboard/DashboardShell";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";

const nav = [
  { href: "/dashboard/student", label: "Overview" },
  { href: "/dashboard/student/applications", label: "My Applications" },
  { href: "/dashboard/student/orders", label: "Service Orders" },
  { href: "/dashboard/student/favorites", label: "Saved Properties" },
];

export default async function StudentOrdersPage() {
  const session = await requireAuth(["STUDENT"]);

  const orders = await prisma.serviceOrder.findMany({
    where: { studentId: session.user.id },
    include: { service: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell title="Service Orders" nav={<DashboardNav links={nav} />}>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-5">
            <div className="flex justify-between gap-4">
              <div>
                <p className="font-semibold">{order.title}</p>
                <p className="text-sm text-slate-500">{order.service.title}</p>
                {order.budget && (
                  <p className="text-sm text-emerald-700">Budget: {formatCurrency(order.budget)}</p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  Ordered {format(order.createdAt, "dd MMM yyyy")}
                </p>
              </div>
              <Badge
                variant={
                  order.status === "COMPLETED"
                    ? "success"
                    : order.status === "IN_PROGRESS"
                      ? "info"
                      : "warning"
                }
              >
                {order.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-slate-600 line-clamp-2">{order.description}</p>
          </Card>
        ))}
        {orders.length === 0 && (
          <Card className="p-8 text-center text-slate-500">
            <p>No service orders yet.</p>
            <Link href="/services" className="mt-4 inline-block text-emerald-700 hover:underline">
              Browse services →
            </Link>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
