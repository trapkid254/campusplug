import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { UserRole } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function whatsappLink(phone: string, message?: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const formatted = cleaned.startsWith("254")
    ? cleaned
    : cleaned.startsWith("0")
      ? `254${cleaned.slice(1)}`
      : `254${cleaned}`;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${formatted}${text}`;
}

export function parseAmenities(amenities: string): string[] {
  try {
    const parsed = JSON.parse(amenities);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return amenities.split(",").map((a) => a.trim()).filter(Boolean);
  }
}

export function stringifyAmenities(amenities: string[]): string {
  return JSON.stringify(amenities);
}

export const PROPERTY_TYPES = [
  { value: "HOSTEL", label: "Hostel" },
  { value: "BEDSITTER", label: "Bedsitter" },
  { value: "SINGLE_ROOM", label: "Single Room" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "SHARED_APARTMENT", label: "Shared Apartment" },
  { value: "RENTAL_HOUSE", label: "Rental House" },
] as const;

export const INTERNSHIP_CATEGORIES = [
  { value: "TECHNOLOGY", label: "Technology" },
  { value: "FINANCE", label: "Finance" },
  { value: "MARKETING", label: "Marketing" },
  { value: "ENGINEERING", label: "Engineering" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "EDUCATION", label: "Education" },
  { value: "HOSPITALITY", label: "Hospitality" },
  { value: "AGRICULTURE", label: "Agriculture" },
  { value: "MEDIA", label: "Media" },
  { value: "OTHER", label: "Other" },
] as const;

export const SERVICE_CATEGORIES = [
  { value: "RESEARCH_ASSISTANCE", label: "Research Assistance" },
  { value: "DATA_ANALYSIS", label: "Data Analysis (SPSS, R, Excel, Python)" },
  { value: "CV_WRITING", label: "CV Writing" },
  { value: "PROPOSAL_WRITING", label: "Proposal Writing" },
  { value: "REPORT_FORMATTING", label: "Report Formatting" },
  { value: "EDITING_PROOFREADING", label: "Editing & Proofreading" },
  { value: "PRESENTATION_DESIGN", label: "Presentation Design" },
  { value: "ACADEMIC_CONSULTATION", label: "Academic Consultation" },
] as const;

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin";
    case "LANDLORD":
      return "/dashboard/landlord";
    case "INTERNSHIP_PROVIDER":
      return "/dashboard/provider";
    default:
      return "/dashboard/student";
  }
}

export const KENYAN_UNIVERSITIES = [
  "University of Nairobi",
  "Kenyatta University",
  "Jomo Kenyatta University of Agriculture and Technology",
  "Moi University",
  "Egerton University",
  "Maseno University",
  "Technical University of Kenya",
  "Dedan Kimathi University",
  "Mount Kenya University",
  "Strathmore University",
  "USIU-Africa",
  "Daystar University",
  "Catholic University of Eastern Africa",
  "Multimedia University of Kenya",
  "KCA University",
] as const;
