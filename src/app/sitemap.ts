import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  const [properties, internships, services] = await Promise.all([
    prisma.property.findMany({ where: { status: "APPROVED" }, select: { slug: true, updatedAt: true } }),
    prisma.internship.findMany({ where: { status: "APPROVED" }, select: { slug: true, updatedAt: true } }),
    prisma.academicService.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticPages = ["", "/properties", "/internships", "/services", "/about", "/contact", "/faq", "/terms", "/privacy"];

  return [
    ...staticPages.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...properties.map((p) => ({
      url: `${base}/properties/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...internships.map((i) => ({
      url: `${base}/internships/${i.slug}`,
      lastModified: i.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...services.map((s) => ({
      url: `${base}/services/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
