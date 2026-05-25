import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/dashboard/AdminShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

export default async function AdminOrdersPage() {
  await requireAuth(["ADMIN"]);

  const orders = await prisma.serviceOrder.findMany({
    include: {
      service: { select: { title: true, category: true } },
      student: { select: { name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell
      title="Service Orders"
      description="Manage academic support requests from students"
    >
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">{order.title}</p>
                <p className="text-sm text-slate-500">{order.service.title}</p>
                <p className="mt-2 text-sm">
                  <span className="text-slate-500">Student: </span>
                  {order.student.name} ({order.student.email})
                </p>
                {order.budget && (
                  <p className="text-sm text-emerald-700">Budget: {formatCurrency(order.budget)}</p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  {format(order.createdAt, "dd MMM yyyy HH:mm")}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
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
                <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
              </div>
            </div>
            <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              {order.description}
            </p>
          </Card>
        ))}
        {orders.length === 0 && (
          <Card className="p-12 text-center text-slate-500">No service orders yet.</Card>
        )}
      </div>
    </AdminShell>
  );
}
