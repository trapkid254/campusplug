import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { completePayment } from "@/lib/mpesa";
import { notifyPaymentSuccess } from "@/lib/notifications";

/**
 * Safaricom Daraja M-Pesa STK callback handler.
 * Register this URL in Daraja portal: /api/payments/mpesa/callback
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = body.Body?.stkCallback;

    if (!result) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const checkoutRequestId = result.CheckoutRequestID;
    const resultCode = result.ResultCode;

    const payment = await prisma.payment.findFirst({
      where: { checkoutId: checkoutRequestId },
    });

    if (!payment) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (resultCode === 0) {
      const receiptItem = result.CallbackMetadata?.Item?.find(
        (i: { Name: string }) => i.Name === "MpesaReceiptNumber"
      );
      const receipt = receiptItem?.Value ? String(receiptItem.Value) : undefined;

      await completePayment(payment.id, receipt);

      if (receipt) {
        notifyPaymentSuccess(payment.userId, payment.amount, receipt).catch(console.error);
      }
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("[M-Pesa callback]", err);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
