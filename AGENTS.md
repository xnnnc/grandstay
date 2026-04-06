<!-- Generated: 2026-02-24 | Updated: 2026-03-09 -->

# GrandStay - Hotel Management System

## Purpose
Full-stack hotel management application built with Next.js 15 App Router, React 19, TypeScript, Prisma ORM (SQLite), and Tailwind CSS. Manages rooms, reservations, guests, billing, housekeeping, concierge services, staff, and multi-hotel operations.

## Key Files
| File | Description |
|------|-------------|
| `package.json` | Dependencies and scripts (dev, build, seed, prisma) |
| `next.config.ts` | Next.js configuration |
| `tsconfig.json` | TypeScript strict mode configuration |
| `middleware.ts` | Auth middleware - protects dashboard routes |
| `eslint.config.mjs` | ESLint flat config |
| `postcss.config.mjs` | PostCSS + Tailwind setup |
| `components.json` | shadcn/ui component configuration |
| `prisma.config.ts` | Prisma client generation config |
| `.env` | Environment variables (DATABASE_URL, SESSION_SECRET) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router pages and layouts (see `app/AGENTS.md`) |
| `components/` | React components organized by feature (see `components/AGENTS.md`) |
| `actions/` | Server actions for data mutations (see `actions/AGENTS.md`) |
| `lib/` | Shared utilities, DB client, auth (see `lib/AGENTS.md`) |
| `types/` | TypeScript type definitions (see `types/AGENTS.md`) |
| `hooks/` | Custom React hooks (see `hooks/AGENTS.md`) |
| `patterns/` | Design patterns: Adapter, State (see `patterns/AGENTS.md`) |
| `prisma/` | Database schema and seed script (see `prisma/AGENTS.md`) |
| `public/` | Static assets (SVG icons) |

## For AI Agents

### Working In This Directory
- Use `npm run dev` to start development server
- Use `npx prisma db seed` to seed database
- Use `npx prisma db push` after schema changes
- All server data fetching is in `actions/` directory
- All pages are server components that delegate to client components in `components/`
- For every frontend, UI, styling, layout, or visual refinement task, read and follow `Uncodixfy.md` before making changes

### Testing Requirements
- Run `npx tsc --noEmit` for type checking
- Run `npx react-doctor@latest . --verbose` for React best practices (target: 100/100)

### Common Patterns
- Server Component pages fetch data, pass to Client Component wrappers (`*-client.tsx`)
- Server Actions in `actions/` handle all mutations with `"use server"`
- UI primitives from shadcn/ui in `components/ui/`
- Feature components in `components/{feature}/`
- Turkish language UI, English code
- `Uncodixfy.md` is the project-wide frontend style guardrail; use it to avoid generic AI-looking UI choices

## Dependencies

### External
- Next.js 15 - App Router, Server Components, Server Actions
- React 19 - UI framework with useTransition, useOptimistic
- Prisma 6 - ORM with SQLite
- Tailwind CSS 4 - Utility-first styling
- shadcn/ui - Component library (Radix UI primitives)
- @phosphor-icons/react - Icon library
- recharts - Charts (lazy-loaded with next/dynamic)
- class-variance-authority - Component variants
- date-fns - Date formatting
