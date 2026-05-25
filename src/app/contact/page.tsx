"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { siteConfig } from "@/lib/config";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        subject: form.get("subject"),
        message: form.get("message"),
      }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Contact Us</h1>
      <p className="mt-2 text-slate-600">We&apos;d love to hear from you</p>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {[
            { icon: Mail, text: siteConfig.contact.email },
            { icon: Phone, text: siteConfig.contact.phone },
            { icon: MapPin, text: siteConfig.contact.address },
          ].map(({ icon: Icon, text }) => (
            <p key={text} className="flex items-center gap-3 text-slate-600">
              <Icon className="h-5 w-5 text-emerald-600" />
              {text}
            </p>
          ))}
        </div>
        <Card className="p-6">
          {sent ? (
            <p className="text-emerald-700">Message sent! We&apos;ll get back to you soon.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input name="name" label="Name" required />
              <Input name="email" type="email" label="Email" required />
              <Input name="phone" label="Phone" />
              <Input name="subject" label="Subject" required />
              <Textarea name="message" label="Message" required />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
