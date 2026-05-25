# CampusPlug – Student Marketplace Platform

**CampusPlug** is Kenya's all-in-one digital ecosystem for university students — combining student accommodation, internships & attachments, and academic support services in one modern platform.

## Features

### 🏠 Student Housing
- Property listings (hostels, bedsitters, apartments, rental houses)
- Advanced search & filters (location, campus, price, type, amenities)
- Image galleries, Google Maps integration
- WhatsApp & phone contact
- Landlord dashboards with analytics
- Featured listings & subscription plans

### 💼 Internships & Attachments
- Company posting system with provider accounts
- Student application workflow
- Search by category, location, paid/unpaid, remote/on-site
- Admin moderation & approval

### 📚 Academic Support Services
- Service marketplace (research, SPSS/data analysis, CV writing, etc.)
- Order/request system with tracking
- M-Pesa payment integration

### 👥 User Roles
| Role | Capabilities |
|------|-------------|
| **Student** | Browse, save favorites, apply, order services |
| **Landlord/Agent** | Create/edit/delete listings, view inquiries, M-Pesa subscriptions |
| **Internship Provider** | Post/edit/delete internships, review applications, update applicant status |
| **Admin** | Full moderation panel — properties, internships, users, orders, payments |

### Admin Panel (`/dashboard/admin`)
- **Overview** — stats, quick approvals
- **Properties** — filter by status, approve/reject/feature/verify
- **Internships** — filter by status, approve/reject/feature/close
- **Users** — verify users, delete accounts, filter by role
- **Service Orders** — update order status
- **Payments** — revenue reports and transaction history

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS 4
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (Neon, Supabase, Docker, or Vercel Postgres)
- **Auth:** NextAuth.js v5 (credentials)
- **Payments:** M-Pesa Daraja API (stub included)

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Start PostgreSQL (Docker)
docker compose up db -d

# Set up environment
cp .env.example .env

# Run migrations & seed demo data
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

> **Deploying?** Set `DATABASE_URL` to a `postgresql://...` connection string in your hosting dashboard. The build runs `prisma migrate deploy` automatically.

Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campusplug.co.ke | admin123 |
| Student | student@campusplug.co.ke | student123 |
| Landlord | landlord@campusplug.co.ke | landlord123 |
| Provider | provider@campusplug.co.ke | provider123 |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── properties/         # Housing module
│   ├── internships/        # Careers module
│   ├── services/           # Academic services
│   ├── dashboard/          # Role-based dashboards
│   └── api/                # API routes
├── components/             # React components
└── lib/                    # Utilities, auth, prisma
prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Demo data
```

## Image Uploads

- **Local dev:** Images save to `public/uploads/` automatically
- **Production:** Configure [Cloudinary](https://cloudinary.com) in `.env` (required for Vercel)

## Email Notifications

Configure SMTP in `.env`. Emails are sent for:
- Welcome on registration
- Property inquiries (to landlord)
- Internship applications (to provider)
- Application status updates (to student)
- Service orders (to admin)
- Listing approvals (to landlord)
- Password reset

In development without SMTP, emails are logged to the console.

## Password Reset

Users can reset passwords at `/forgot-password`.

## Integrations

See **[INTEGRATIONS.md](./INTEGRATIONS.md)** for detailed setup of:
- M-Pesa Daraja STK Push (sandbox & production)
- Google OAuth login
- Africa's Talking SMS notifications

## M-Pesa Configuration

Add your Safaricom Daraja API credentials to `.env`:

```env
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
```

Without credentials, payments run in **demo mode** (auto-completed).

## Production Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for full guides covering:
- **Vercel** + Neon/Supabase PostgreSQL
- **Docker Compose** with PostgreSQL
- **Manual VPS** deployment with PM2

Quick Docker start:
```bash
cp .env.example .env
docker compose up -d --build
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:push` | Sync database schema |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

## License

Proprietary – CampusPlug Kenya © 2026
