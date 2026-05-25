import { prisma } from "./prisma";

const isConfigured = () =>
  Boolean(
    process.env.MPESA_CONSUMER_KEY &&
      process.env.MPESA_CONSUMER_SECRET &&
      process.env.MPESA_SHORTCODE &&
      process.env.MPESA_PASSKEY
  );

export function isMpesaConfigured() {
  return isConfigured();
}

function getBaseUrl() {
  return process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

function getTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

export function formatMpesaPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("254")) return cleaned;
  if (cleaned.startsWith("0")) return `254${cleaned.slice(1)}`;
  if (cleaned.length === 9) return `254${cleaned}`;
  return cleaned;
}

function generatePassword(timestamp: string): string {
  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  return Buffer.from(shortcode + passkey + timestamp).toString("base64");
}

let cachedToken: { token: string; expires: number } | null = null;

export async function getMpesaAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expires > Date.now()) {
    return cachedToken.token;
  }

  const key = process.env.MPESA_CONSUMER_KEY!;
  const secret = process.env.MPESA_CONSUMER_SECRET!;
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");

  const res = await fetch(
    `${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  );

  if (!res.ok) {
    throw new Error("Failed to obtain M-Pesa access token");
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expires: Date.now() + 55 * 60 * 1000,
  };
  return data.access_token;
}

export interface StkPushParams {
  amount: number;
  phoneNumber: string;
  accountReference: string;
  transactionDesc: string;
}

export interface StkPushResult {
  merchantRequestId: string;
  checkoutRequestId: string;
  responseDescription: string;
}

export async function initiateStkPush(params: StkPushParams): Promise<StkPushResult> {
  const token = await getMpesaAccessToken();
  const timestamp = getTimestamp();
  const password = generatePassword(timestamp);
  const shortcode = process.env.MPESA_SHORTCODE!;
  const phone = formatMpesaPhone(params.phoneNumber);
  const callbackUrl =
    process.env.MPESA_CALLBACK_URL ||
    `${process.env.NEXTAUTH_URL}/api/payments/mpesa/callback`;

  const res = await fetch(`${getBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(params.amount),
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: params.accountReference.slice(0, 12),
      TransactionDesc: params.transactionDesc.slice(0, 13),
    }),
  });

  const data = await res.json();

  if (data.ResponseCode !== "0") {
    throw new Error(data.ResponseDescription || data.errorMessage || "STK push failed");
  }

  return {
    merchantRequestId: data.MerchantRequestID,
    checkoutRequestId: data.CheckoutRequestID,
    responseDescription: data.ResponseDescription,
  };
}

export async function queryStkStatus(checkoutRequestId: string) {
  const token = await getMpesaAccessToken();
  const timestamp = getTimestamp();
  const password = generatePassword(timestamp);
  const shortcode = process.env.MPESA_SHORTCODE!;

  const res = await fetch(`${getBaseUrl()}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }),
  });

  return res.json();
}

export async function activateSubscription(userId: string, planId: string) {
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) return;

  await prisma.subscription.updateMany({
    where: { userId, active: true },
    data: { active: false },
  });

  await prisma.subscription.create({
    data: {
      userId,
      planId: plan.id,
      expiresAt: new Date(Date.now() + plan.durationDays * 86400000),
    },
  });
}

export async function completePayment(
  paymentId: string,
  mpesaReceipt?: string
) {
  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "COMPLETED",
      ...(mpesaReceipt && { mpesaReceipt }),
    },
  });

  if (payment.purpose === "LANDLORD_SUBSCRIPTION" && payment.metadata) {
    try {
      const { planId } = JSON.parse(payment.metadata);
      if (planId) await activateSubscription(payment.userId, planId);
    } catch {
      /* ignore */
    }
  }

  return payment;
}
