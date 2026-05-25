"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  ClipboardList,
  CreditCard,
} from "lucide-react";

const links = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/properties", label: "Properties", icon: Building2 },
  { href: "/dashboard/admin/internships", label: "Internships", icon: Briefcase },
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  { href: "/dashboard/admin/orders", label: "Service Orders", icon: ClipboardList },
  { href: "/dashboard/admin/payments", label: "Payments", icon: CreditCard },
];

export function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-5">
        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Admin Panel
            </p>
            <nav className="mt-3 space-y-1">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                    pathname === href
                      ? "bg-emerald-100 text-emerald-800"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
              <Link
                href="/"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
              >
                ← Back to site
              </Link>
            </nav>
          </div>
        </aside>
        <div className="lg:col-span-4">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {description && <p className="mt-1 text-slate-600">{description}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
