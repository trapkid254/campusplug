import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/dashboard/AdminShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { UserActions } from "@/components/admin/UserActions";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  await requireAuth(["ADMIN"]);
  const { role } = await searchParams;

  const users = await prisma.user.findMany({
    where: role ? { role: role as "STUDENT" | "LANDLORD" | "INTERNSHIP_PROVIDER" | "ADMIN" } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      verified: true,
      createdAt: true,
      _count: {
        select: {
          properties: true,
          internships: true,
          applications: true,
        },
      },
    },
  });

  return (
    <AdminShell title="User Management" description={`${users.length} registered users`}>
      <div className="flex flex-wrap gap-2 mb-6">
        {["", "STUDENT", "LANDLORD", "INTERNSHIP_PROVIDER", "ADMIN"].map((r) => (
          <a
            key={r || "all"}
            href={r ? `/dashboard/admin/users?role=${r}` : "/dashboard/admin/users"}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              (role || "") === r
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {r || "All"}
          </a>
        ))}
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Activity</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-slate-500">{u.email}</p>
                  {u.verified && (
                    <Badge variant="success" className="mt-1">
                      Verified
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge>{u.role}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {u._count.properties > 0 && <p>{u._count.properties} listings</p>}
                  {u._count.internships > 0 && <p>{u._count.internships} internships</p>}
                  {u._count.applications > 0 && <p>{u._count.applications} applications</p>}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {u.createdAt.toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <UserActions userId={u.id} verified={u.verified} role={u.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminShell>
  );
}
