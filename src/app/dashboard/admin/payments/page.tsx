import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/dashboard/AdminShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

export default async function AdminPaymentsPage() {
  await requireAuth(["ADMIN"]);

  const payments = await prisma.payment.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const completed = payments.filter((p) => p.status === "COMPLETED");
  const revenue = completed.reduce((s, p) => s + p.amount, 0);

  const byPurpose = completed.reduce(
    (acc, p) => {
      acc[p.purpose] = (acc[p.purpose] || 0) + p.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <AdminShell title="Payments & Revenue" description="Transaction history and reports">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-700">{formatCurrency(revenue)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Transactions</p>
          <p className="text-2xl font-bold">{payments.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="text-2xl font-bold">{completed.length}</p>
        </Card>
      </div>

      {Object.keys(byPurpose).length > 0 && (
        <Card className="mt-6 p-5">
          <h2 className="font-semibold text-slate-900">Revenue by Type</h2>
          <div className="mt-4 space-y-2">
            {Object.entries(byPurpose).map(([purpose, amount]) => (
              <div key={purpose} className="flex justify-between text-sm">
                <span className="text-slate-600">{purpose.replace(/_/g, " ")}</span>
                <span className="font-medium">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Purpose</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Receipt</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <p className="font-medium">{p.user.name}</p>
                  <p className="text-slate-500">{p.user.email}</p>
                </td>
                <td className="px-4 py-3 font-medium">{formatCurrency(p.amount)}</td>
                <td className="px-4 py-3 text-slate-500">{p.purpose.replace(/_/g, " ")}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      p.status === "COMPLETED"
                        ? "success"
                        : p.status === "PENDING"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {p.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-500">{p.mpesaReceipt || "—"}</td>
                <td className="px-4 py-3 text-slate-500">{p.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminShell>
  );
}
