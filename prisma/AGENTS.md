<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-24 | Updated: 2026-02-24 -->

# prisma

## Purpose
Database schema definition and seed script for the Prisma ORM with SQLite.

## Key Files
| File | Description |
|------|-------------|
| `schema.prisma` | Database schema — models: User, Hotel, Room, Reservation, Guest, Invoice, InvoiceItem, HousekeepingTask, ServiceRequest, Notification |
| `seed.ts` | Seed script populating test data for all models |

## For AI Agents

### Working In This Directory
- After modifying `schema.prisma`, run `npx prisma db push` to apply changes
- Run `npx prisma db seed` to re-seed with test data
- Run `npx prisma generate` to regenerate the client after schema changes
- SQLite database file is `dev.db` in project root
- Prisma client is generated to `lib/generated/prisma/`

### Common Patterns
- Models use `String @id @default(cuid())` for primary keys
- DateTime fields use `@default(now())`
- Relations use explicit foreign keys with `@relation`
- Enums defined inline for status fields
