import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  isMpesaConfigured,
  initiateStkPush,
  activateSubscription,
  completePayment,
} from "@/lib/mpesa";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount, purpose, phoneNumber, planId } = await req.json();

  if (!amount || !purpose || !phoneNumber) {
    return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
  }

  const reference = `CP${Date.now().toString(36).toUpperCase()}`;

  // Demo mode when M-Pesa not configured
  if (!isMpesaConfigured()) {
    const payment = await prisma.payment.create({
      data: {
        amount,
        purpose,
        phoneNumber,
        checkoutId: reference,
        userId: session.user.id,
        status: "COMPLETED",
        mpesaReceipt: `DEMO-${reference}`,
        metadata: planId ? JSON.stringify({ planId }) : undefined,
      },
    });

    if (purpose === "LANDLORD_SUBSCRIPTION" && planId) {
      await activateSubscription(session.user.id, planId);
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      demo: true,
      message: "Demo payment completed — subscription activated!",
    });
  }

  try {
    const payment = await prisma.payment.create({
      data: {
        amount,
        purpose,
        phoneNumber,
        checkoutId: reference,
        userId: session.user.id,
        status: "PENDING",
        metadata: JSON.stringify({
          planId: planId || null,
          accountReference: reference,
        }),
      },
    });

    const stk = await initiateStkPush({
      amount,
      phoneNumber,
      accountReference: reference,
      transactionDesc: "CampusPlug Payment",
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        checkoutId: stk.checkoutRequestId,
        metadata: JSON.stringify({
          planId: planId || null,
          merchantRequestId: stk.merchantRequestId,
          accountReference: reference,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      checkoutRequestId: stk.checkoutRequestId,
      message: "STK push sent! Enter your M-Pesa PIN on your phone.",
      poll: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "M-Pesa payment failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
