"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function DashboardNav({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "block rounded-lg px-3 py-2 text-sm font-medium transition",
            pathname === link.href
              ? "bg-emerald-100 text-emerald-800"
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          {link.label}
        </Link>
      ))}
      <Link
        href="/"
        className="block rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
      >
        ← Back to site
      </Link>
    </nav>
  );
}

export function DashboardShell({
  title,
  children,
  nav,
}: {
  title: string;
  children: React.ReactNode;
  nav: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Dashboard</h2>
            <div className="mt-4">{nav}</div>
          </div>
        </aside>
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
