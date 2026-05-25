import { siteConfig } from "@/lib/config";
import { Card } from "@/components/ui/Card";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-slate-900">About {siteConfig.name}</h1>
      <p className="mt-6 text-lg text-slate-600 leading-relaxed">
        CampusPlug is Kenya&apos;s centralized digital ecosystem connecting university and college
        students with affordable accommodation, career opportunities, and trusted academic support
        services — all in one modern platform.
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {[
          { title: "Housing", desc: "Find hostels, bedsitters & rentals near your campus" },
          { title: "Careers", desc: "Internships, attachments & graduate trainee programs" },
          { title: "Academics", desc: "Research, data analysis, CV writing & more" },
        ].map((item) => (
          <Card key={item.title} className="p-6 text-center">
            <h3 className="font-semibold text-emerald-700">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
