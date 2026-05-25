import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify, stringifyAmenities } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding CampusPlug database...");

  const password = await bcrypt.hash("admin123", 12);
  const studentPass = await bcrypt.hash("student123", 12);
  const landlordPass = await bcrypt.hash("landlord123", 12);
  const providerPass = await bcrypt.hash("provider123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@campusplug.co.ke" },
    update: {},
    create: {
      email: "admin@campusplug.co.ke",
      password,
      name: "CampusPlug Admin",
      role: "ADMIN",
      verified: true,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@campusplug.co.ke" },
    update: {},
    create: {
      email: "student@campusplug.co.ke",
      password: studentPass,
      name: "Jane Wanjiku",
      phone: "0712345678",
      role: "STUDENT",
    },
  });

  const landlord = await prisma.user.upsert({
    where: { email: "landlord@campusplug.co.ke" },
    update: {},
    create: {
      email: "landlord@campusplug.co.ke",
      password: landlordPass,
      name: "Peter Kamau Properties",
      phone: "0722111222",
      role: "LANDLORD",
      verified: true,
    },
  });

  const provider = await prisma.user.upsert({
    where: { email: "provider@campusplug.co.ke" },
    update: {},
    create: {
      email: "provider@campusplug.co.ke",
      password: providerPass,
      name: "Safaricom Talent",
      companyName: "Safaricom PLC",
      role: "INTERNSHIP_PROVIDER",
      verified: true,
    },
  });

  const universities = [
    { name: "University of Nairobi", city: "Nairobi", slug: "uon" },
    { name: "Kenyatta University", city: "Nairobi", slug: "ku" },
    { name: "Jomo Kenyatta University of Agriculture and Technology", city: "Juja", slug: "jkuat" },
    { name: "Moi University", city: "Eldoret", slug: "moi" },
    { name: "Strathmore University", city: "Nairobi", slug: "strathmore" },
    { name: "Technical University of Kenya", city: "Nairobi", slug: "tuk" },
    { name: "Mount Kenya University", city: "Thika", slug: "mku" },
    { name: "USIU-Africa", city: "Nairobi", slug: "usiu" },
  ];

  for (const uni of universities) {
    await prisma.university.upsert({
      where: { slug: uni.slug },
      update: {},
      create: uni,
    });
  }

  const uon = await prisma.university.findUnique({ where: { slug: "uon" } });
  const ku = await prisma.university.findUnique({ where: { slug: "ku" } });

  const properties = [
    {
      title: "Modern Hostel Near UoN Main Campus",
      propertyType: "HOSTEL" as const,
      description:
        "Clean, secure hostel with 24/7 security, WiFi, and study areas. Walking distance to University of Nairobi main campus. Shared bathrooms, single beds with study desks.",
      location: "States House Road, Nairobi",
      latitude: -1.2797,
      longitude: 36.8172,
      monthlyRent: 8500,
      depositAmount: 5000,
      furnished: true,
      genderSpecific: "Mixed",
      amenities: stringifyAmenities(["WiFi", "24/7 Security", "Water", "Study Area", "Laundry"]),
      contactPhone: "0722111222",
      whatsappNumber: "0722111222",
      universityId: uon?.id,
      featured: true,
      verified: true,
    },
    {
      title: "Affordable Bedsitter in Kahawa Wendani",
      propertyType: "BEDSITTER" as const,
      description:
        "Spacious bedsitter ideal for JKUAT and MKU students. Self-contained with kitchenette. Quiet neighborhood, matatu stage nearby.",
      location: "Kahawa Wendani, Thika Road",
      latitude: -1.1833,
      longitude: 36.9333,
      monthlyRent: 7000,
      depositAmount: 7000,
      furnished: false,
      genderSpecific: null,
      amenities: stringifyAmenities(["Water", "Electricity", "Parking"]),
      contactPhone: "0722111222",
      universityId: ku?.id,
      featured: true,
      verified: true,
    },
    {
      title: "Female-Only Hostel in Parklands",
      propertyType: "HOSTEL" as const,
      description:
        "Safe female-only accommodation with CCTV, generator backup, and common kitchen. Popular with USIU and UoN students.",
      location: "Parklands, Nairobi",
      monthlyRent: 12000,
      depositAmount: 10000,
      furnished: true,
      genderSpecific: "Female",
      amenities: stringifyAmenities(["WiFi", "CCTV", "Generator", "Kitchen", "Security"]),
      contactPhone: "0722111222",
      featured: false,
      verified: true,
    },
    {
      title: "2-Bedroom Shared Apartment in Ruaraka",
      propertyType: "SHARED_APARTMENT" as const,
      description:
        "Share a modern apartment with one other student. Fully furnished living room and kitchen. Close to TUK and Kenyatta University.",
      location: "Ruaraka, Nairobi",
      monthlyRent: 15000,
      depositAmount: 15000,
      furnished: true,
      genderSpecific: "Mixed",
      amenities: stringifyAmenities(["WiFi", "Furnished", "Parking", "Balcony"]),
      contactPhone: "0722111222",
      universityId: ku?.id,
      featured: true,
    },
  ];

  for (const prop of properties) {
    const slug = slugify(prop.title);
    const existing = await prisma.property.findUnique({ where: { slug } });
    if (!existing) {
      await prisma.property.create({
        data: {
          ...prop,
          slug,
          status: "APPROVED",
          landlordId: landlord.id,
          images: {
            create: [
              {
                url: "https://images.unsplash.com/photo-1555854877-0b40670a0b0e?w=800&h=600&fit=crop",
                order: 0,
              },
              {
                url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
                order: 1,
              },
            ],
          },
        },
      });
    }
  }

  const internships = [
    {
      title: "Software Engineering Intern",
      companyName: "Safaricom PLC",
      location: "Nairobi",
      category: "TECHNOLOGY" as const,
      duration: "3 months",
      requirements: "3rd/4th year CS student, knowledge of Java/Python, good communication skills",
      description:
        "Join our Digital IT team for a hands-on internship building solutions for millions of Kenyans. Work alongside senior engineers on real projects.",
      applicationDeadline: new Date("2026-08-31"),
      applicationInstructions: "Apply through CampusPlug with your cover letter and CV.",
      stipend: "KES 25,000/month",
      paid: true,
      workMode: "HYBRID" as const,
      featured: true,
    },
    {
      title: "Marketing & Communications Attachment",
      companyName: "Equity Bank",
      location: "Nairobi",
      category: "MARKETING" as const,
      duration: "6 months",
      requirements: "Marketing, Communications or Business student, creative portfolio a plus",
      description:
        "Support the marketing team with social media, content creation, and campus activations across Kenyan universities.",
      applicationDeadline: new Date("2026-07-15"),
      applicationInstructions: "Submit cover letter explaining your interest in fintech marketing.",
      stipend: "KES 15,000/month",
      paid: true,
      workMode: "ONSITE" as const,
      featured: true,
    },
    {
      title: "Data Analytics Industrial Attachment",
      companyName: "KCB Bank",
      location: "Nairobi",
      category: "FINANCE" as const,
      duration: "4 months",
      requirements: "Statistics, Economics or IT student, Excel and SQL skills required",
      description:
        "Work with the data analytics team on customer insights, reporting dashboards, and business intelligence projects.",
      applicationDeadline: new Date("2026-09-01"),
      applicationInstructions: "Apply with cover letter highlighting your data skills.",
      paid: false,
      workMode: "ONSITE" as const,
    },
  ];

  for (const job of internships) {
    const slug = slugify(`${job.title}-${job.companyName}`);
    const existing = await prisma.internship.findUnique({ where: { slug } });
    if (!existing) {
      await prisma.internship.create({
        data: {
          ...job,
          slug,
          status: "APPROVED",
          providerId: provider.id,
        },
      });
    }
  }

  const services = [
    {
      title: "Research Paper Assistance",
      slug: "research-assistance",
      category: "RESEARCH_ASSISTANCE" as const,
      description:
        "Professional help with research papers, literature reviews, and academic writing. Our consultants ensure originality and proper citation.",
      priceFrom: 1500,
      priceTo: 8000,
      featured: true,
    },
    {
      title: "SPSS & Data Analysis",
      slug: "data-analysis",
      category: "DATA_ANALYSIS" as const,
      description:
        "Expert data analysis using SPSS, R, Excel, or Python. Perfect for thesis, dissertation, and project data interpretation.",
      priceFrom: 2000,
      priceTo: 12000,
      featured: true,
    },
    {
      title: "Professional CV Writing",
      slug: "cv-writing",
      category: "CV_WRITING" as const,
      description:
        "ATS-optimized CV and cover letter tailored for Kenyan job market and internship applications.",
      priceFrom: 800,
      priceTo: 2500,
      featured: true,
    },
    {
      title: "Proposal & Project Writing",
      slug: "proposal-writing",
      category: "PROPOSAL_WRITING" as const,
      description:
        "Help crafting research proposals, project proposals, and chapter outlines for university submissions.",
      priceFrom: 2500,
      priceTo: 10000,
    },
    {
      title: "Editing & Proofreading",
      slug: "editing-proofreading",
      category: "EDITING_PROOFREADING" as const,
      description:
        "Professional editing for grammar, structure, formatting, and plagiarism check before submission.",
      priceFrom: 500,
      priceTo: 3000,
    },
    {
      title: "PowerPoint Presentation Design",
      slug: "presentation-design",
      category: "PRESENTATION_DESIGN" as const,
      description:
        "Eye-catching academic presentations with professional templates, charts, and speaker notes.",
      priceFrom: 1000,
      priceTo: 4000,
    },
  ];

  for (const svc of services) {
    await prisma.academicService.upsert({
      where: { slug: svc.slug },
      update: {},
      create: svc,
    });
  }

  await prisma.subscriptionPlan.upsert({
    where: { id: "basic-landlord" },
    update: {},
    create: {
      id: "basic-landlord",
      name: "Basic Landlord",
      description: "Up to 5 property listings for 30 days",
      price: 1500,
      durationDays: 30,
      maxListings: 5,
      featuredSlots: 0,
      role: "LANDLORD",
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { id: "premium-landlord" },
    update: {},
    create: {
      id: "premium-landlord",
      name: "Premium Landlord",
      description: "Unlimited listings + 2 featured slots for 30 days",
      price: 3500,
      durationDays: 30,
      maxListings: 50,
      featuredSlots: 2,
      role: "LANDLORD",
    },
  });

  const stats = [
    { key: "properties", value: 500, label: "Listings" },
    { key: "students", value: 10000, label: "Students" },
    { key: "internships", value: 200, label: "Opportunities" },
    { key: "universities", value: 15, label: "Campuses" },
  ];

  for (const stat of stats) {
    await prisma.siteStat.upsert({
      where: { key: stat.key },
      update: { value: stat.value },
      create: stat,
    });
  }

  const testimonials = [
    {
      name: "Brian Ochieng",
      role: "UoN Student",
      content:
        "Found my hostel in one day through CampusPlug. The WhatsApp contact made it so easy to arrange a viewing!",
      rating: 5,
    },
    {
      name: "Grace Muthoni",
      role: "JKUAT Student",
      content:
        "Got my industrial attachment at a top company through CampusPlug. The application process was smooth.",
      rating: 5,
    },
    {
      name: "David Kimani",
      role: "Strathmore Student",
      content:
        "Used the data analysis service for my thesis. Professional work, delivered on time. Highly recommend!",
      rating: 5,
    },
  ];

  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({ data: testimonials });

  console.log("Seed completed!");
  console.log("Demo logins:");
  console.log("  Admin:    admin@campusplug.co.ke / admin123");
  console.log("  Student:  student@campusplug.co.ke / student123");
  console.log("  Landlord: landlord@campusplug.co.ke / landlord123");
  console.log("  Provider: provider@campusplug.co.ke / provider123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
