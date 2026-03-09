# Architecture

## Top-Level Shape
- The app is a monolithic Next.js App Router application rooted in `app/`.
- Rendering is split between server pages in `app/` and client feature components in `components/`.
- Data access and mutations are centralized in feature-scoped server action modules under `actions/`.
- Persistence is centralized through Prisma in `lib/db.ts` and `prisma/schema.prisma`.

## Request and Render Flow
- Incoming requests pass through auth middleware in `middleware.ts`.
- Route groups split login flow from authenticated dashboard flow: `app/(auth)/` and `app/(dashboard)/`.
- Server pages fetch data from `actions/*` or auth utilities, then hand prepared props to `*-client.tsx` entry components.
- Example page-to-client handoff appears in `app/(dashboard)/page.tsx` -> `components/dashboard/dashboard-client.tsx`.

## Server-Side Layering
- `actions/*.ts` files are the main service boundary and all begin with `"use server"`.
- These actions enforce access with `getCurrentUser()` from `lib/auth.ts`.
- Most actions query or mutate Prisma models directly, then call `revalidatePath()` for affected screens.
- Response shape is usually `{ success, data?, error? }`, visible in files such as `actions/dashboard.ts`, `actions/rooms.ts`, and `actions/billing.ts`.

## Client-Side Layering
- `components/*/*-client.tsx` files own UI state, filtering, dialogs, and interaction orchestration.
- Child feature components under each feature folder handle display concerns such as tables, cards, dialogs, and charts.
- Client components call server actions directly and often refresh navigation state with `router.refresh()` after successful mutation.

## Auth Model
- Middleware only checks for the presence of a `session-token` cookie in `middleware.ts`.
- `lib/session.ts` writes and deletes that cookie.
- `lib/auth.ts` resolves the cookie value to a Prisma `User` record and returns a password-stripped object.
- Role checks are performed ad hoc inside actions and layout logic, rather than through a shared policy layer.

## Data Model Boundaries
- Core business entities are `Hotel`, `User`, `Room`, `Guest`, `Reservation`, `Invoice`, `HousekeepingTask`, `ServiceRequest`, and `Notification` in `prisma/schema.prisma`.
- Many operational workflows pivot on room lifecycle and reservation status.
- Room state transitions are wrapped by a State pattern in `patterns/state/room-state.ts` and consumed in `actions/rooms.ts` and `actions/housekeeping.ts`.
- Currency display and exchange-rate lookup are abstracted behind an Adapter pattern in `patterns/adapter/currency-adapter.ts` and consumed in billing components/actions.

## Cross-Cutting Patterns
- Charts are isolated behind client-only dynamic imports to avoid SSR issues, e.g. `components/dashboard/occupancy-chart.tsx`.
- Theme management is globally injected in `app/layout.tsx` and toggled from `components/layout/header.tsx`.
- Shared presentation primitives live in `components/ui/`, while shared helper widgets live in `components/shared/`.

## Notable Architectural Shortcuts
- Dashboard routes still use hardcoded mock users in `app/(dashboard)/layout.tsx` and `app/(dashboard)/page.tsx`.
- Login route is a client page in `app/(auth)/login/page.tsx`, while most other pages follow the server-page to client-component pattern.
- Many AGENTS docs describe more complete subsystems than the current implementation actually contains, so verified code should win over local documentation.
