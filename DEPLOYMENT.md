# CampusPlug Deployment Guide

## Option 1: Vercel (Recommended for quick launch)

### Prerequisites
- [Vercel](https://vercel.com) account
- PostgreSQL database ([Neon](https://neon.tech), [Supabase](https://supabase.com), or [Vercel Postgres](https://vercel.com/storage/postgres))

### Steps

1. **Push code to GitHub**

2. **Import project in Vercel** and set root directory to this repo

3. **Environment variables** (Vercel Dashboard → Settings → Environment Variables):

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://...` (your Postgres connection string) |
| `AUTH_SECRET` | Random 32+ char string |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` |
| `SMTP_HOST` | Your SMTP host |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `EMAIL_FROM` | `CampusPlug <noreply@yourdomain.com>` |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
| `MPESA_*` | Safaricom Daraja credentials |

4. **Database** — set `DATABASE_URL` to your Postgres connection string (must start with `postgresql://`). Migrations run automatically on build via `prisma migrate deploy`.

### Preventing build-time Prisma errors

- This repo includes a build-time validator that runs before `next build` to ensure the Prisma `provider` in `prisma/schema.prisma` matches the `DATABASE_URL` protocol. The script is executed as the `prebuild` npm script and will fail the build with a clear message if there is a mismatch.
- On Vercel, ensure `DATABASE_URL` in Project Settings points to your Postgres database (starts with `postgresql://`) if your `prisma/schema.prisma` provider is `postgresql`. Do NOT set a Postgres URL when your provider is `sqlite`.

If you need help switching providers (sqlite for local dev, Postgres for production), I can add a short workflow or migration notes.

### Common build error: Prisma P1001 (Can't reach database server)

- Message: `Error: P1001: Can't reach database server at \`host:5432\``
- Cause: Your `DATABASE_URL` in the build environment points to an unreachable or placeholder host (e.g. `host:5432`, `localhost`, or `127.0.0.1`) while `prisma/schema.prisma` is configured for `postgresql`.
- Why it happens on Vercel: Vercel builds run in the cloud — `localhost` or local-only Postgres instances are not reachable. Using a placeholder host (like the example `host:5432`) will also fail.

Fixes:

1. Use a managed cloud Postgres for production (Neon, Supabase, Vercel Postgres) and set `DATABASE_URL` in Vercel Project Settings to the provided connection string (must start with `postgresql://`).
2. If you want to keep sqlite for local dev, do NOT set the same `DATABASE_URL` in Vercel; instead set a production Postgres URL only in Vercel. The repo includes a prebuild validator that will fail early with a helpful message if there's a mismatch.
3. If your Postgres is self-hosted, ensure it accepts remote connections and that network rules (firewall, VPC) allow connections from Vercel. Consider using VPC peering or a provider that integrates with Vercel.

Quick checks locally:

```bash
# test Postgres reachability (replace with your connection)
PGPASSWORD=yourpass pg_isready -h host -p 5432 -U campusplug

# or try connecting with psql
psql "postgresql://campusplug:campusplug_secret@host:5432/campusplug"
```

If you want, I can add a small CI script that attempts a TCP connect to your host:5432 before the build to catch network issues earlier.

5. **Seed production** (optional, once):
   ```bash
   DATABASE_URL="postgresql://..." npm run db:seed
   ```

5. **Deploy** — Vercel auto-builds on push

> **Note:** Use Cloudinary for image uploads on Vercel (serverless filesystem is ephemeral).

---

## Option 2: Docker (VPS / Railway / DigitalOcean)

### Prerequisites
- Docker & Docker Compose installed
- Domain pointed to your server (optional)

### Steps

1. **Clone and configure**
   ```bash
   cp .env.example .env
   # Edit .env — set AUTH_SECRET, NEXTAUTH_URL, SMTP, etc.
   ```

2. **Set `DATABASE_URL`** in `.env` to the Docker Postgres URL (see `.env.example`).

3. **Build and start**
   ```bash
   docker compose up -d --build
   ```

4. **Initialize database** (first time only)
   ```bash
   docker compose exec app npx prisma migrate deploy
   docker compose exec app npm run db:seed
   ```

5. **Access** at `http://localhost:3000`

### Production tips
- Put **Nginx** or **Caddy** in front for HTTPS
- Set `NEXTAUTH_URL` to your HTTPS domain
- Use **Cloudinary** for images (or mount a persistent volume — already configured in docker-compose)
- Configure M-Pesa callback URL to your production domain

---

## Option 3: Manual Node.js server

```bash
npm install
cp .env.example .env
# DATABASE_URL must be postgresql://...

npm run db:migrate
npm run db:seed
npm run build
npm start
```

Use **PM2** for process management:
```bash
npm install -g pm2
pm2 start npm --name campusplug -- start
pm2 save
```

---

## Post-deployment checklist

- [ ] Change all demo passwords
- [ ] Set strong `AUTH_SECRET`
- [ ] Configure SMTP for email notifications
- [ ] Set up Cloudinary for image uploads
- [ ] Register M-Pesa Daraja callback URL
- [ ] Test registration, login, listing creation
- [ ] Test M-Pesa payment in sandbox mode first
- [ ] Submit sitemap to Google Search Console: `https://yourdomain.com/sitemap.xml`

---

## Environment reference

See `.env.example` for all supported variables.

### Email providers

| Provider | SMTP_HOST | SMTP_PORT |
|----------|-----------|-----------|
| Gmail (App Password) | smtp.gmail.com | 587 |
| SendGrid | smtp.sendgrid.net | 587 |
| Mailgun | smtp.mailgun.org | 587 |

### Cloudinary setup
1. Create free account at [cloudinary.com](https://cloudinary.com)
2. Copy Cloud Name, API Key, API Secret to `.env`
3. Images will upload to `campusplug/` folder automatically
