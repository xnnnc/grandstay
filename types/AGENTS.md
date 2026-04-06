<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-24 | Updated: 2026-02-24 -->

# types

## Purpose
Shared TypeScript type definitions for the entire application.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | All shared types: UserRole, Room, Reservation, Guest, Invoice, HousekeepingTask, ServiceRequest, Hotel, Staff, Notification, etc. |

## For AI Agents

### Working In This Directory
- Types mirror Prisma schema models but are plain TypeScript interfaces
- Used across actions, components, and pages
- Import as `import type { TypeName } from "@/types"`
- When adding a new feature, define types here first
