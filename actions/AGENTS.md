<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-24 | Updated: 2026-02-24 -->

# actions

## Purpose
Server Actions (`"use server"`) for all data mutations and queries. Each file maps to a feature module and contains CRUD operations using Prisma ORM.

## Key Files
| File | Description |
|------|-------------|
| `auth.ts` | Login, logout, password validation |
| `billing.ts` | Invoice CRUD, payment processing, line items |
| `concierge.ts` | Service request CRUD, assignment, status updates |
| `dashboard.ts` | Dashboard stats, occupancy data, recent activities |
| `guests.ts` | Guest CRUD, search, reservation history |
| `hotels.ts` | Hotel CRUD, multi-hotel management |
| `housekeeping.ts` | Task CRUD, assignment, completion |
| `notifications.ts` | Notification CRUD, mark as read |
| `reservations.ts` | Reservation CRUD, check-in/out, availability |
| `reports.ts` | Report data aggregation (revenue, occupancy, etc.) |
| `rooms.ts` | Room CRUD, status management |
| `staff.ts` | Staff CRUD, role management |

## For AI Agents

### Working In This Directory
- Every function must start with `"use server"` or the file must have `"use server"` at top
- Always validate user session with `getCurrentUser()` before mutations
- Return `{ success: boolean, data?: T, error?: string }` pattern
- Use Prisma client from `@/lib/db`
- Handle errors with try/catch, never throw to client

### Common Patterns
- `getCurrentUser()` from `@/lib/auth` for auth checks
- `prisma.model.findMany/create/update/delete` for CRUD
- `revalidatePath()` after mutations to refresh UI
- Return typed result objects

## Dependencies

### Internal
- `lib/db` - Prisma client instance
- `lib/auth` - `getCurrentUser()` for session validation
- `types/` - Shared TypeScript types

### External
- `next/cache` - `revalidatePath` for cache invalidation
- `@prisma/client` - Database operations
