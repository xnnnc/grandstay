# Concerns

## Documentation Drift
- `AGENTS.md` claims Next.js 15 and Prisma 6, but `package.json` shows Next.js 16 and Prisma 7.
- `actions/AGENTS.md` references `actions/notifications.ts`, which is not present in `actions/`.
- `components/AGENTS.md` references a `components/notifications/` area that is not present in the current tree.

## Authentication Weaknesses
- `middleware.ts` only checks whether a `session-token` cookie exists; it does not validate or sign the value.
- `lib/session.ts` stores the raw user id directly in the cookie.
- `lib/auth.ts` treats that cookie as a primary-key lookup, so session integrity depends on cookie secrecy alone.
- `AGENTS.md` mentions `SESSION_SECRET`, but current session code does not use it.

## Mock and Placeholder Behavior in Production Paths
- `app/(dashboard)/layout.tsx` uses a hardcoded `mockUser` for sidebar/header role data.
- `app/(dashboard)/page.tsx` falls back to `MOCK_USER` when auth resolution fails.
- `app/(dashboard)/settings/page.tsx` also contains mock user/profile data.
- These shortcuts can hide auth or role-propagation bugs during real usage.

## Testing and Verification Gaps
- No automated test files were found.
- There is no `test` npm script and no dedicated typecheck script in `package.json`.
- High-risk business logic such as reservation overlap checks, room transition rules, and invoice calculations has no visible automated coverage.

## Error Observability Gaps
- Many server actions use bare `catch {}` blocks and discard root-cause details, including `actions/dashboard.ts`, `actions/reservations.ts`, and `lib/auth.ts`.
- This keeps user messages clean but makes debugging and production diagnosis harder.

## Model and Type Mismatch Risks
- Prisma model fields such as status/type are mostly plain strings in `prisma/schema.prisma` rather than Prisma enums.
- Shared unions exist in `types/index.ts`, but persistence still accepts broader string values.
- `prisma/seed.ts` inserts service request types like `"SPA"` that are not included in `ServiceRequestType` inside `types/index.ts`.

## Implementation/Data Drift Risks
- `prisma/AGENTS.md` mentions an `InvoiceItem` model, but the schema stores invoice items as JSON in the `Invoice.items` string column.
- Reservation statuses in seed data include `"RESERVED"`, while `ReservationStatus` in `types/index.ts` does not include that value.

## Maintainability Hotspots
- Large multi-responsibility files such as `components/reservations/reservation-wizard.tsx`, `actions/billing.ts`, and `actions/reservations.ts` carry substantial UI or business logic in a single module.
- `app/globals.css` is large and mixes tokens, animations, utility classes, and component-like styling in one file.

## Operational Gaps
- Notifications exist in schema and seed data, but no matching action module or feature directory is present.
- The app appears to rely on local SQLite only; no migration or deployment hardening is visible beyond Prisma config.
