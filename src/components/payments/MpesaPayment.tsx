"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Loader2, CheckCircle } from "lucide-react";

export function MpesaPayment({
  amount,
  purpose,
  planId,
  label,
}: {
  amount: number;
  purpose: string;
  planId?: string;
  label: string;
}) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function pollPaymentStatus(paymentId: string) {
    setPolling(true);
    let attempts = 0;
    const maxAttempts = 30;

    pollRef.current = setInterval(async () => {
      attempts++;
      const res = await fetch(`/api/payments/${paymentId}/status`);
      const data = await res.json();

      if (data.status === "COMPLETED") {
        if (pollRef.current) clearInterval(pollRef.current);
        setPolling(false);
        setCompleted(true);
        setMessage(`Payment successful! Receipt: ${data.receipt || "confirmed"}`);
        router.refresh();
      } else if (data.status === "FAILED" || attempts >= maxAttempts) {
        if (pollRef.current) clearInterval(pollRef.current);
        setPolling(false);
        setError(
          attempts >= maxAttempts
            ? "Payment timed out. Check M-Pesa messages or try again."
            : "Payment failed or was cancelled."
        );
      }
    }, 3000);
  }

  async function handlePay() {
    setLoading(true);
    setError("");
    setMessage("");
    setCompleted(false);

    const res = await fetch("/api/payments/mpesa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, purpose, phoneNumber: phone, planId }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      if (data.demo) {
        setCompleted(true);
        setMessage(data.message);
        router.refresh();
      } else if (data.poll && data.paymentId) {
        setMessage(data.message);
        pollPaymentStatus(data.paymentId);
      } else {
        setMessage(data.message);
      }
    } else {
      setError(data.error || "Payment failed");
    }
  }

  return (
    <Card className="p-5">
      <p className="font-semibold text-slate-900">{label}</p>
      <p className="mt-1 text-2xl font-bold text-emerald-700">KES {amount.toLocaleString()}</p>
      <div className="mt-4 space-y-3">
        <Input
          label="M-Pesa Phone Number"
          placeholder="0712345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={polling || completed}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && (
          <p className={`text-sm ${completed ? "text-emerald-700" : "text-slate-600"}`}>
            {completed && <CheckCircle className="mb-1 inline h-4 w-4" />}{" "}
            {message}
          </p>
        )}
        {polling && (
          <p className="flex items-center gap-2 text-sm text-amber-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Waiting for M-Pesa confirmation...
          </p>
        )}
        <Button
          onClick={handlePay}
          disabled={loading || polling || completed || !phone}
          className="w-full"
        >
          {loading ? "Sending STK push..." : completed ? "Paid" : "Pay with M-Pesa"}
        </Button>
      </div>
    </Card>
  );
}
