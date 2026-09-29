# Aaloo

A full-stack restaurant management and QR-based ordering platform connecting table-side customer ordering directly to kitchen order tickets (KOT) and billing.

Built as a monorepo using Next.js, Express, PostgreSQL, Prisma, and Turborepo.

---

## Screenshots

| Diner QR Storefront | Operator Dashboard (Table View) |
| :---: | :---: |
| ![Storefront](docs/screenshots/storefront.png) | ![Dashboard](docs/screenshots/dashboard.png) |

---

## Overview

Aaloo provides an end-to-end workflow for dine-in restaurants and cafes:

- **Customer Ordering (Storefront)**: Customers scan a table QR code on their phone, customize items with variants and add-on groups, and send orders directly to the kitchen without needing an account or app download.
- **Floor Management & POS (Dashboard)**: Restaurant staff manage active table sessions, track customer headcount, take walk-in orders, and handle live orders.
- **Kitchen Order Tickets (KOT)**: Orders sent to the kitchen generate sequential tickets that reset daily. Subsequent orders from the same table are marked as supplementary so kitchen staff only prepare new items.
- **Billing & Payments**: Supports GST calculations, shop-level service charges, sequential bill numbers per financial year, bill splitting, and multi-mode payment settlements (Cash, Card, UPI, Wallet).

---

## Monorepo Structure

Managed with pnpm workspaces and Turborepo:

```
├── apps/
│   ├── dashboard/       # Next.js 16 (App Router) - Operator dashboard and POS
│   └── storefront/      # Next.js 16 (Mobile-first) - Customer menu, cart, and ordering
├── services/
│   └── api-gateway/     # Express 5 - REST API, billing logic, and authentication
└── packages/
    ├── api-sdk/         # Shared Axios client with typed endpoints and cookie auth
    ├── database/        # Prisma schema, migrations, and PostgreSQL client
    ├── types/           # Shared Zod validation schemas and TypeScript types
    ├── ui/              # Shared component library
    ├── tailwind-config/ # Shared Tailwind CSS configurations
    ├── eslint-config/   # Shared ESLint rules
    └── typescript-config/ # Shared TypeScript configurations
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- pnpm (`npm install -g pnpm`)
- Docker and Docker Compose

### 1. Install dependencies
```bash
pnpm install
```

### 2. Start PostgreSQL
```bash
pnpm infra:up
```

### 3. Configure environment variables
Create `.env` files in the respective directories:

```env
# services/api-gateway/.env
DATABASE_URL="postgresql://aloo:secret@localhost:5432/aloo_db?schema=public"
JWT_SECRET="your-jwt-secret-key"
PORT=3000
```

```env
# apps/dashboard/.env
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"
NEXT_PUBLIC_QR_URL="http://localhost:5001"
```

```env
# apps/storefront/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"
```

### 4. Run database migrations
```bash
pnpm db:migrate
pnpm db:generate
```

### 5. Start development servers
```bash
pnpm dev
```

- Dashboard: http://localhost:5000
- Storefront: http://localhost:5001
- API Gateway: http://localhost:3000

---

## Production Deployment

- **Database**: Managed PostgreSQL (Supabase, Neon, or Railway)
- **Backend**: Container or Node runtime on Railway, Render, or Fly.io
- **Frontends**: Next.js deployments on Vercel

Run production migrations:
```bash
pnpm --filter @repo/database db:deploy
```

---

## License

ISC License. Built by Gautam Chouhan ([@gautam-ch](https://github.com/gautam-ch)).
