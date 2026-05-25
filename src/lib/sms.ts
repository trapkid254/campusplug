import { formatMpesaPhone } from "./mpesa";

export function isSmsConfigured() {
  return Boolean(process.env.AT_API_KEY && process.env.AT_USERNAME);
}

export async function sendSMS(to: string, message: string): Promise<boolean> {
  if (!isSmsConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[SMS dev] To: ${formatMpesaPhone(to)} | ${message}`);
    }
    return false;
  }

  try {
    const username = process.env.AT_USERNAME!;
    const apiKey = process.env.AT_API_KEY!;
    const isSandbox = process.env.AT_ENV !== "production";
    const baseUrl = isSandbox
      ? "https://api.sandbox.africastalking.com"
      : "https://api.africastalking.com";

    const res = await fetch(`${baseUrl}/version1/messaging`, {
      method: "POST",
      headers: {
        apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        username,
        to: formatMpesaPhone(to),
        message: message.slice(0, 160),
      }),
    });

    const data = await res.json();
    return data.SMSMessageData?.Recipients?.[0]?.status === "Success";
  } catch (err) {
    console.error("[SMS] Failed:", err);
    return false;
  }
}

export async function sendBulkSMS(recipients: string[], message: string) {
  await Promise.all(recipients.map((to) => sendSMS(to, message)));
}
