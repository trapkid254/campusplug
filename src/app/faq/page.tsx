import { Card } from "@/components/ui/Card";

const faqs = [
  {
    q: "Is CampusPlug free for students?",
    a: "Yes! Creating a student account and browsing listings is completely free.",
  },
  {
    q: "How do I contact a landlord?",
    a: "Each listing has a phone number and WhatsApp button for direct contact.",
  },
  {
    q: "How do landlords list properties?",
    a: "Register as a Landlord/Agent, choose a subscription plan, and add your listings from the dashboard.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We support M-Pesa for subscriptions, featured listings, and academic service payments.",
  },
  {
    q: "Are listings verified?",
    a: "Admin moderates all property and internship listings before they go live. Verified badges indicate trusted landlords.",
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h1>
      <div className="mt-10 space-y-4">
        {faqs.map((faq) => (
          <Card key={faq.q} className="p-6">
            <h3 className="font-semibold text-slate-900">{faq.q}</h3>
            <p className="mt-2 text-slate-600">{faq.a}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
