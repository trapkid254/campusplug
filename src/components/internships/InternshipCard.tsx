import Link from "next/link";
import { MapPin, Clock, Building2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";
import type { Internship } from "@prisma/client";

const categoryLabels: Record<string, string> = {
  TECHNOLOGY: "Technology",
  FINANCE: "Finance",
  MARKETING: "Marketing",
  ENGINEERING: "Engineering",
  HEALTHCARE: "Healthcare",
  EDUCATION: "Education",
  HOSPITALITY: "Hospitality",
  AGRICULTURE: "Agriculture",
  MEDIA: "Media",
  OTHER: "Other",
};

export function InternshipCard({ internship }: { internship: Internship }) {
  return (
    <Link href={`/internships/${internship.slug}`}>
      <Card hover className="group p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <Badge variant="info">{categoryLabels[internship.category]}</Badge>
              {internship.paid && <Badge variant="success">Paid</Badge>}
              {internship.workMode === "REMOTE" && <Badge>Remote</Badge>}
              {internship.featured && <Badge variant="warning">Featured</Badge>}
            </div>
            <h3 className="mt-2 font-semibold text-slate-900 group-hover:text-emerald-700">
              {internship.title}
            </h3>
            <p className="text-sm font-medium text-slate-600">{internship.companyName}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {internship.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Deadline: {format(new Date(internship.applicationDeadline), "dd MMM yyyy")}
              </span>
            </div>
            {internship.stipend && (
              <p className="mt-2 text-sm font-medium text-emerald-700">{internship.stipend}</p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
