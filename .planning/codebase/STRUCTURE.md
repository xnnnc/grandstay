# Structure

## Root Layout
- `app/` contains App Router routes, layouts, loading states, and global CSS.
- `components/` contains feature UI and local UI primitives.
- `actions/` contains feature-scoped server actions.
- `lib/` contains infrastructure helpers such as Prisma access, auth, session, and generated client code.
- `types/` contains shared TypeScript unions and interfaces.
- `patterns/` contains explicit Adapter and State pattern implementations.
- `prisma/` contains the schema and seed script.

## Route Organization
- `app/layout.tsx` is the root HTML shell and provider boundary.
- `app/(auth)/login/page.tsx` is the login route.
- `app/(dashboard)/layout.tsx` is the authenticated shell with sidebar and header chrome.
- Dashboard feature routes live under `app/(dashboard)/rooms/`, `app/(dashboard)/reservations/`, `app/(dashboard)/guests/`, `app/(dashboard)/billing/`, `app/(dashboard)/housekeeping/`, `app/(dashboard)/concierge/`, `app/(dashboard)/reports/`, `app/(dashboard)/staff/`, `app/(dashboard)/hotels/`, and `app/(dashboard)/settings/`.
- Dynamic routes currently include `app/(dashboard)/billing/[id]/page.tsx` and `app/(dashboard)/guests/[id]/page.tsx`.

## Component Organization
- `components/ui/` holds reusable primitive wrappers such as `button.tsx`, `dialog.tsx`, `table.tsx`, `sidebar.tsx`, and `calendar.tsx`.
- `components/layout/` holds app-shell parts such as `sidebar.tsx`, `header.tsx`, and `breadcrumb.tsx`.
- Each domain folder groups its own orchestrator and leaf components, e.g. `components/rooms/`, `components/reservations/`, `components/billing/`, and `components/dashboard/`.
- Shared widgets that do not belong to a single feature sit in `components/shared/`.

## Action Organization
- Each major domain has one server-action module: `actions/rooms.ts`, `actions/reservations.ts`, `actions/guests.ts`, `actions/billing.ts`, `actions/housekeeping.ts`, `actions/concierge.ts`, `actions/hotels.ts`, `actions/staff.ts`, `actions/reports.ts`, `actions/dashboard.ts`, and `actions/auth.ts`.
- Action files generally bundle queries and mutations for the same entity instead of splitting reads and writes.

## Infrastructure Organization
- `lib/db.ts` owns Prisma client initialization.
- `lib/auth.ts` and `lib/session.ts` own auth/session behavior.
- `lib/generated/prisma/` is generated output and should be treated as read-only.
- `prisma/schema.prisma` defines the canonical data model.
- `prisma/seed.ts` is the main local data bootstrap script.

## Naming Patterns
- Pages use `page.tsx`; loading fallbacks use `loading.tsx`.
- Client entry components commonly use the `*-client.tsx` suffix, such as `components/rooms/rooms-client.tsx`.
- Feature folders tend to use nouns matching route names, such as `rooms`, `reservations`, `billing`, and `staff`.
- Shared enums/types are centralized in `types/index.ts`.

## Documentation Layout
- Many directories ship local `AGENTS.md` files that describe expected patterns, including `app/AGENTS.md`, `components/AGENTS.md`, `actions/AGENTS.md`, `lib/AGENTS.md`, and pattern-specific docs under `patterns/`.
- These docs are useful orientation aids, but some entries refer to files that are currently missing.
