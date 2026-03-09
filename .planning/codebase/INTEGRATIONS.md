# Integrations

## Database
- Primary integration is a local SQLite database declared in `prisma/schema.prisma`.
- Prisma accesses the database through `@prisma/adapter-better-sqlite3` in `lib/db.ts`.
- The adapter resolves the database file from `process.cwd()` to `dev.db` in both `lib/db.ts` and `prisma/seed.ts`.

## Authentication and Session Handling
- Login flow is handled by the server action `loginAction()` in `actions/auth.ts`.
- Password verification uses `bcryptjs` in `lib/auth.ts`.
- Sessions are cookie-based, not token-service based, in `lib/session.ts`.
- Middleware checks the `session-token` cookie in `middleware.ts` and redirects unauthenticated users to `/login`.
- `getCurrentUser()` in `lib/auth.ts` treats the cookie value as a direct user id lookup in Prisma.

## Next.js Platform Features
- Middleware integration is configured in `middleware.ts`.
- App Router layouts and route groups integrate server-rendered pages with client components in `app/layout.tsx` and `app/(dashboard)/layout.tsx`.
- Cache revalidation hooks are used through `revalidatePath()` in feature actions such as `actions/rooms.ts`, `actions/billing.ts`, and `actions/reservations.ts`.

## UI and Theming
- Theme integration uses `next-themes` via `components/theme-provider.tsx` and `components/layout/header.tsx`.
- shadcn/ui component generation is configured in `components.json` and implemented locally in `components/ui/`.

## Charting and Visualization
- Chart-heavy screens lazily import client-only chart components with `next/dynamic` in `components/dashboard/occupancy-chart.tsx` and multiple files in `components/reports/`.
- Recharts is the charting dependency declared in `package.json`.

## Currency Conversion Abstraction
- Billing and shared display components integrate with a local adapter in `patterns/adapter/currency-adapter.ts`.
- The adapter wraps a mock exchange source from `patterns/adapter/mock-exchange-service.ts`.
- This is an internal abstraction point, not a live external API integration yet.

## Seeded Operational Data
- Initial environment data is created by `prisma/seed.ts`.
- Seeded records include hotels, users, rooms, reservations, invoices, housekeeping tasks, service requests, and notifications.

## Environment and Config Inputs
- Prisma datasource URL comes from `process.env["DATABASE_URL"]` in `prisma.config.ts`.
- Session cookie security toggles based on `process.env.NODE_ENV` in `lib/session.ts`.
- `AGENTS.md` mentions `.env` with `DATABASE_URL` and `SESSION_SECRET`, but only `DATABASE_URL` is visible in checked code paths.

## Absent or Partial Integrations
- No HTTP client usage or third-party API calls were found in inspected application files.
- No webhook handlers, email providers, payment gateways, or analytics SDKs were found in the current tree.
- Notifications are present in the Prisma schema and seed data, but a corresponding `actions/notifications.ts` module is referenced in docs and not present in `actions/`.
