import Link from "next/link";
import {
  Search,
  Building2,
  Briefcase,
  BookOpen,
  ArrowRight,
  Users,
  Home,
  Star,
  CheckCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { InternshipCard } from "@/components/internships/InternshipCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { siteConfig } from "@/lib/config";
import { formatCurrency } from "@/lib/utils";

async function getHomeData() {
  const [featuredProperties, featuredInternships, services, stats, testimonials, universities] =
    await Promise.all([
      prisma.property.findMany({
        where: { status: "APPROVED", featured: true },
        include: { images: { take: 1 }, university: true },
        take: 6,
        orderBy: { createdAt: "desc" },
      }),
      prisma.internship.findMany({
        where: { status: "APPROVED", featured: true },
        take: 4,
        orderBy: { createdAt: "desc" },
      }),
      prisma.academicService.findMany({
        where: { active: true, featured: true },
        take: 6,
      }),
      prisma.siteStat.findMany(),
      prisma.testimonial.findMany({ where: { active: true }, take: 3 }),
      prisma.university.findMany({ take: 8 }),
    ]);

  const recentProperties =
    featuredProperties.length > 0
      ? featuredProperties
      : await prisma.property.findMany({
          where: { status: "APPROVED" },
          include: { images: { take: 1 }, university: true },
          take: 6,
          orderBy: { createdAt: "desc" },
        });

  const recentInternships =
    featuredInternships.length > 0
      ? featuredInternships
      : await prisma.internship.findMany({
          where: { status: "APPROVED" },
          take: 4,
          orderBy: { createdAt: "desc" },
        });

  return {
    properties: recentProperties,
    internships: recentInternships,
    services,
    stats,
    testimonials,
    universities,
  };
}

const serviceIcons: Record<string, string> = {
  RESEARCH_ASSISTANCE: "📚",
  DATA_ANALYSIS: "📊",
  CV_WRITING: "📄",
  PROPOSAL_WRITING: "✍️",
  REPORT_FORMATTING: "📋",
  EDITING_PROOFREADING: "🔍",
  PRESENTATION_DESIGN: "🎯",
  ACADEMIC_CONSULTATION: "🎓",
};

export default async function HomePage() {
  const { properties, internships, services, stats, testimonials, universities } =
    await getHomeData();

  const statMap = Object.fromEntries(stats.map((s) => [s.key, s]));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
              <Star className="h-4 w-4 text-amber-300" />
              Kenya&apos;s #1 Student Platform
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {siteConfig.tagline}
            </h1>
            <p className="mt-6 text-lg text-emerald-100 leading-relaxed">
              Find affordable accommodation near your campus, discover internships & attachments,
              and access trusted academic support — all in one place.
            </p>
          </div>

          {/* Search bar */}
          <div className="mt-10 rounded-2xl bg-white p-2 shadow-2xl sm:p-3">
            <form action="/properties" className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  name="q"
                  type="text"
                  placeholder="Search location, campus, or property..."
                  className="w-full rounded-xl border-0 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <select
                name="type"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-700 sm:w-44"
              >
                <option value="">All Types</option>
                <option value="HOSTEL">Hostel</option>
                <option value="BEDSITTER">Bedsitter</option>
                <option value="SINGLE_ROOM">Single Room</option>
                <option value="APARTMENT">Apartment</option>
              </select>
              <Button type="submit" size="lg" className="sm:px-8">
                Search
              </Button>
            </form>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/properties">
              <Button variant="secondary" size="lg">
                <Building2 className="h-5 w-5" />
                Browse Housing
              </Button>
            </Link>
            <Link href="/internships">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50"
              >
                <Briefcase className="h-5 w-5" />
                Find Internships
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-200 bg-white py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
          {[
            { key: "properties", label: "Listings", icon: Home, fallback: "500+" },
            { key: "students", label: "Students", icon: Users, fallback: "10,000+" },
            { key: "internships", label: "Opportunities", icon: Briefcase, fallback: "200+" },
            { key: "universities", label: "Campuses", icon: Building2, fallback: "15+" },
          ].map(({ key, label, icon: Icon, fallback }) => (
            <div key={key} className="text-center">
              <Icon className="mx-auto h-8 w-8 text-emerald-600" />
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {statMap[key]?.value ? `${statMap[key].value}+` : fallback}
              </p>
              <p className="text-sm text-slate-500">{statMap[key]?.label || label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Featured Properties</h2>
              <p className="mt-2 text-slate-600">
                Hostels, bedsitters & rentals near top Kenyan universities
              </p>
            </div>
            <Link
              href="/properties"
              className="hidden items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800 sm:flex"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {properties.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <Card className="mt-8 p-12 text-center text-slate-500">
              <Building2 className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4">Properties coming soon. Check back shortly!</p>
            </Card>
          )}
          <Link href="/properties" className="mt-6 flex items-center justify-center gap-1 text-sm font-medium text-emerald-700 sm:hidden">
            View all properties <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Internships */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Internship Opportunities</h2>
              <p className="mt-2 text-slate-600">
                Industrial attachments, graduate trainee & student jobs
              </p>
            </div>
            <Link href="/internships" className="hidden items-center gap-1 text-sm font-medium text-emerald-700 sm:flex">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {internships.length > 0 ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {internships.map((internship) => (
                <InternshipCard key={internship.id} internship={internship} />
              ))}
            </div>
          ) : (
            <Card className="mt-8 p-12 text-center text-slate-500">
              <Briefcase className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4">No internships listed yet.</p>
            </Card>
          )}
        </div>
      </section>

      {/* Academic Services */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900">Academic Support Services</h2>
          <p className="mt-2 text-slate-600">
            Research, data analysis, CV writing & more from verified consultants
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(services.length > 0
              ? services
              : [
                  { id: "1", title: "Research Assistance", category: "RESEARCH_ASSISTANCE", priceFrom: 1500, slug: "research" },
                  { id: "2", title: "Data Analysis (SPSS, R, Python)", category: "DATA_ANALYSIS", priceFrom: 2000, slug: "data-analysis" },
                  { id: "3", title: "CV & Cover Letter Writing", category: "CV_WRITING", priceFrom: 800, slug: "cv-writing" },
                ]
            ).map((service) => (
              <Link key={service.id} href={`/services/${service.slug}`}>
                <Card hover className="p-5">
                  <span className="text-3xl">{serviceIcons[service.category] || "📖"}</span>
                  <h3 className="mt-3 font-semibold text-slate-900">{service.title}</h3>
                  <p className="mt-1 text-sm text-emerald-700 font-medium">
                    From {formatCurrency(service.priceFrom)}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/services">
              <Button variant="outline">Explore All Services</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Universities */}
      {universities.length > 0 && (
        <section className="border-t border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold text-slate-900">Popular Campuses</h2>
            <p className="mt-2 text-center text-slate-600">
              Find housing and opportunities near your university
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {universities.map((uni) => (
                <Link
                  key={uni.id}
                  href={`/properties?university=${uni.slug}`}
                  className="rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  {uni.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-emerald-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold text-slate-900">What Students Say</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <Card key={t.id} className="p-6">
                  <div className="flex gap-1 text-amber-400">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-slate-600 leading-relaxed">&ldquo;{t.content}&rdquo;</p>
                  <p className="mt-4 font-semibold text-slate-900">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-900 px-8 py-12 text-center text-white sm:px-16">
            <h2 className="text-3xl font-bold">Ready to get started?</h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">
              Join thousands of Kenyan students finding housing, internships, and academic help on
              CampusPlug.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button size="lg">Create Free Account</Button>
              </Link>
              <Link href="/register?role=landlord">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  List Your Property
                </Button>
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              {["Free student account", "M-Pesa payments", "Verified listings", "WhatsApp contact"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
