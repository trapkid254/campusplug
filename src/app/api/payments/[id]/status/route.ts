import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMpesaConfigured, queryStkStatus, completePayment } from "@/lib/mpesa";
import { notifyPaymentSuccess } from "@/lib/notifications";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const payment = await prisma.payment.findUnique({ where: { id } });

  if (!payment || payment.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (payment.status === "COMPLETED") {
    return NextResponse.json({ status: "COMPLETED", receipt: payment.mpesaReceipt });
  }

  if (payment.status === "FAILED") {
    return NextResponse.json({ status: "FAILED" });
  }

  // Poll Daraja for pending STK payments
  if (isMpesaConfigured() && payment.checkoutId) {
    try {
      const query = await queryStkStatus(payment.checkoutId);
      if (query.ResultCode === "0") {
        const receipt = query.ResultDesc?.includes("success")
          ? payment.checkoutId
          : undefined;
        await completePayment(payment.id, receipt);
        if (receipt) {
          notifyPaymentSuccess(payment.userId, payment.amount, receipt).catch(console.error);
        }
        return NextResponse.json({ status: "COMPLETED", receipt });
      }
      if (query.ResultCode === "1032" || query.ResultCode === "1") {
        return NextResponse.json({ status: "PENDING", message: "Awaiting payment" });
      }
    } catch {
      /* query may fail while user is still entering PIN */
    }
  }

  return NextResponse.json({ status: payment.status });
}
