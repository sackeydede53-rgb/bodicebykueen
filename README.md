# Bodice by Kueen

Luxury ecommerce storefront for **Bodice by Kueen** — Ghana-ready checkout with Mobile Money via Paystack, admin product management, and pre-order support.

## Stack

- Next.js (App Router) + TypeScript
- SQLite locally / [Turso](https://turso.tech) (libSQL) in production
- Prisma
- NextAuth (admin credentials)
- Paystack (GHS Mobile Money)

## Local setup

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

Default admin (from `.env`):

- Email: `admin@bodicebykueen.com`
- Password: `admin123`

## Environment

Copy `.env.example` to `.env` and set:

- `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY` — from your Paystack Ghana dashboard
- `AUTH_SECRET` — random string for sessions
- Optional SMTP vars for real order emails (otherwise emails log to the console)

## Deploy on Vercel

Local SQLite (`file:./dev.db`) and `better-sqlite3` do **not** work on Vercel. Use Turso:

1. Create a free database at [turso.tech](https://turso.tech) (or `turso db create bodice`).
2. Copy the connection URL and auth token.
3. In **Vercel → Project → Settings → Environment Variables**, add:

| Variable | Example |
| --- | --- |
| `TURSO_DATABASE_URL` | `libsql://bodice-xxx.turso.io` |
| `TURSO_AUTH_TOKEN` | (token from Turso) |
| `DATABASE_URL` | same as `TURSO_DATABASE_URL` (for Prisma CLI if needed) |
| `AUTH_SECRET` | long random string |
| `NEXTAUTH_URL` / `AUTH_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | admin login |
| `PAYSTACK_*` / `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack keys |

4. Put the Turso values in your local `.env` as well, then apply schema + seed:

```bash
npm run db:push:turso
npm run db:seed
```

(`db:seed` uses `TURSO_*` when set, so it seeds the remote DB.)

5. Redeploy on Vercel (or push to GitHub if auto-deploy is on).

**Note:** Product image uploads under `public/uploads` are ephemeral on Vercel. Prefer remote image URLs (or add Blob/Cloudinary later) for production images.

## Features

- Luxury storefront (home, shop filters, product detail, cart, checkout)
- Guest checkout with Paystack MoMo
- Pre-order products with ETA labels
- Admin: products, variants, image upload, categories, orders, promo codes
