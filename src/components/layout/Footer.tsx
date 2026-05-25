import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Find Housing", href: "/properties" },
    { label: "Internships", href: "/internships" },
    { label: "Academic Services", href: "/services" },
    { label: "List Your Property", href: "/register?role=landlord" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ],
  Legal: [
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
                C
              </div>
              <span className="text-xl font-bold text-white">
                Campus<span className="text-emerald-400">Plug</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              {siteConfig.description}
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-400" />
                {siteConfig.contact.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-400" />
                {siteConfig.contact.phone}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-400" />
                {siteConfig.contact.address}
              </p>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                {title}
              </h3>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition hover:text-emerald-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved. Made for
            Kenyan students.
          </p>
        </div>
      </div>
    </footer>
  );
}
