import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { MpesaPayment } from "@/components/payments/MpesaPayment";

export default async function LandlordSubscriptionPage() {
  const session = await requireAuth(["LANDLORD", "ADMIN"]);

  const [plans, activeSub, payments] = await Promise.all([
    prisma.subscriptionPlan.findMany({
      where: { role: "LANDLORD", active: true },
      orderBy: { price: "asc" },
    }),
    prisma.subscription.findFirst({
      where: { userId: session.user.id, active: true, expiresAt: { gt: new Date() } },
      include: { plan: true },
    }),
    prisma.payment.findMany({
      where: { userId: session.user.id, purpose: "LANDLORD_SUBSCRIPTION" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/dashboard/landlord" className="text-sm text-emerald-700 hover:underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Subscription Plans</h1>
      <p className="text-slate-600">Choose a plan to list properties on CampusPlug</p>

      {activeSub && (
        <Card className="mt-6 border-emerald-200 bg-emerald-50 p-5">
          <p className="font-semibold text-emerald-800">Current Plan: {activeSub.plan.name}</p>
          <p className="text-sm text-emerald-700">
            Valid until {activeSub.expiresAt.toLocaleDateString()} · up to{" "}
            {activeSub.plan.maxListings} listings
          </p>
        </Card>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className="p-6">
            <h2 className="text-lg font-bold text-slate-900">{plan.name}</h2>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {formatCurrency(plan.price)}
              <span className="text-sm font-normal text-slate-500">/{plan.durationDays} days</span>
            </p>
            <p className="mt-3 text-sm text-slate-600">{plan.description}</p>
            <ul className="mt-4 space-y-1 text-sm text-slate-600">
              <li>• Up to {plan.maxListings} listings</li>
              <li>• {plan.featuredSlots} featured slots</li>
            </ul>
            <div className="mt-6">
              <MpesaPayment
                amount={plan.price}
                purpose="LANDLORD_SUBSCRIPTION"
                planId={plan.id}
                label={`Subscribe to ${plan.name}`}
              />
            </div>
          </Card>
        ))}
      </div>

      {payments.length > 0 && (
        <section className="mt-10">
          <h2 className="font-semibold text-slate-900">Payment History</h2>
          <Card className="mt-4 divide-y divide-slate-100">
            {payments.map((p) => (
              <div key={p.id} className="flex justify-between p-4 text-sm">
                <span>{formatCurrency(p.amount)}</span>
                <span className="capitalize text-slate-500">{p.status.toLowerCase()}</span>
                <span className="text-slate-400">{p.createdAt.toLocaleDateString()}</span>
              </div>
            ))}
          </Card>
        </section>
      )}
    </div>
  );
}
