import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { Card } from "@/components/ui/Card";
import { Building2 } from "lucide-react";
import { PROPERTY_TYPES } from "@/lib/utils";
import type { Prisma, PropertyType } from "@prisma/client";

interface SearchParams {
  q?: string;
  type?: string;
  university?: string;
  minPrice?: string;
  maxPrice?: string;
  furnished?: string;
  gender?: string;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const where: Prisma.PropertyWhereInput = {
    status: "APPROVED",
    availability: "AVAILABLE",
  };

  if (params.q) {
    where.OR = [
      { title: { contains: params.q } },
      { location: { contains: params.q } },
      { description: { contains: params.q } },
    ];
  }

  if (params.type) {
    where.propertyType = params.type as PropertyType;
  }

  if (params.university) {
    where.university = { slug: params.university };
  }

  if (params.minPrice || params.maxPrice) {
    where.monthlyRent = {};
    if (params.minPrice) where.monthlyRent.gte = parseInt(params.minPrice);
    if (params.maxPrice) where.monthlyRent.lte = parseInt(params.maxPrice);
  }

  if (params.furnished === "true") where.furnished = true;
  if (params.furnished === "false") where.furnished = false;
  if (params.gender) where.genderSpecific = params.gender;

  const [properties, universities] = await Promise.all([
    prisma.property.findMany({
      where,
      include: { images: { take: 1, orderBy: { order: "asc" } }, university: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    }),
    prisma.university.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Student Housing</h1>
        <p className="mt-2 text-slate-600">
          Find hostels, bedsitters, and rentals near Kenyan campuses
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <Card className="sticky top-24 p-5">
            <h2 className="font-semibold text-slate-900">Filters</h2>
            <form className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Search</label>
                <input
                  name="q"
                  defaultValue={params.q}
                  placeholder="Location or keyword..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Property Type</label>
                <select
                  name="type"
                  defaultValue={params.type || ""}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">All Types</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">University</label>
                <select
                  name="university"
                  defaultValue={params.university || ""}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">All Campuses</option>
                  {universities.map((u) => (
                    <option key={u.id} value={u.slug}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Min (KES)</label>
                  <input
                    name="minPrice"
                    type="number"
                    defaultValue={params.minPrice}
                    placeholder="3000"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Max (KES)</label>
                  <input
                    name="maxPrice"
                    type="number"
                    defaultValue={params.maxPrice}
                    placeholder="20000"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Furnished</label>
                <select
                  name="furnished"
                  defaultValue={params.furnished || ""}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Any</option>
                  <option value="true">Furnished</option>
                  <option value="false">Unfurnished</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Gender</label>
                <select
                  name="gender"
                  defaultValue={params.gender || ""}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Any</option>
                  <option value="Male">Male Only</option>
                  <option value="Female">Female Only</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Apply Filters
              </button>
            </form>
          </Card>
        </aside>

        <div className="lg:col-span-3">
          <p className="mb-4 text-sm text-slate-500">{properties.length} properties found</p>
          {properties.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <Card className="p-16 text-center">
              <Building2 className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-500">No properties match your filters.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}