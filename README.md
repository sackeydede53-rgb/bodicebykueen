# Bodice by Kueen

Luxury ecommerce storefront for **Bodice by Kueen** — Ghana-ready checkout with Mobile Money via Paystack, admin product management, and pre-order support.

## Stack

- Next.js (App Router) + TypeScript
- SQLite + Prisma
- NextAuth (admin credentials)
- Paystack (GHS Mobile Money)

## Setup

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

## Features

- Luxury storefront (home, shop filters, product detail, bag, checkout)
- Guest checkout with Paystack MoMo
- Pre-order products with ETA labels
- Admin: products, variants, image upload, categories, orders, promo codes
