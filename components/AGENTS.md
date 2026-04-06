<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-24 | Updated: 2026-03-09 -->

# components

## Purpose
React components organized by feature domain. Feature components handle UI logic and composition. Primitive components from shadcn/ui provide unstyled Radix UI building blocks. Main entry points are `*-client.tsx` components that receive server-prepared data as props.

## Key Patterns

### Client Component Entry Points
- `*-client.tsx` files are marked `"use client"` and serve as the primary interface
- Receive pre-fetched data from server pages via props
- Handle state management, filtering, sorting, user interactions
- Call server actions for mutations, then `router.refresh()` to update UI

### Dialog Pattern with Edit Key
- Dialog component accepts optional `edit` prop for add/edit mode
- Using `key={editItem?.id}` forces React to unmount/remount, resetting form state safely
- Example: `<GuestDialog key={editGuest?.id} guest={editGuest} />`

### Shared Utilities
- `cn()` from `@/lib/utils` for Tailwind class merging
- Date formatting with `toLocaleDateString("tr-TR", ...)`
- Currency formatting with `Intl.NumberFormat("tr-TR", { style: "currency", ... })`

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `ui/` | shadcn/ui primitives — Radix UI wrappers (see `ui/AGENTS.md`) |
| `layout/` | App shell — sidebar, header, breadcrumb (see `layout/AGENTS.md`) |
| `billing/` | Invoice management, payment recording |
| `check-in/` | Check-in and check-out flows |
| `concierge/` | Service request orchestration and tracking |
| `dashboard/` | Dashboard overview with stats, charts, recent activity |
| `guests/` | Guest CRUD, detail views, reservation history |
| `hotels/` | Hotel CRUD, multi-hotel management |
| `housekeeping/` | Task orchestration, assignment, completion |
| `notifications/` | Notification center |
| `reports/` | Business intelligence — occupancy, revenue, guest analytics |
| `reservations/` | Booking wizard, reservation list, filters |
| `rooms/` | Room CRUD, status badges, grid/table views |
| `shared/` | Reusable utilities — currency display, loading skeletons |
| `staff/` | Staff CRUD, role management |

## For AI Agents

### Working In This Directory
- Components are client-side only (`"use client"` at top of file)
- Server data flows in via props — do not fetch data inside components
- Use `useRouter()` and `useTransition()` for optimistic UI updates
- Call server actions from `@/actions/` for mutations
- After mutations, call `router.refresh()` to revalidate and update
- All UI uses shadcn/ui primitives from `components/ui/`
- For every component-level UI, styling, spacing, layout, and interaction decision, read and follow `../Uncodixfy.md`

### Common Patterns
- **List with search/filter**: useState for filters, useMemo for filtered array, map with handlers
- **Modal dialogs**: Open/close state, optional `key={item?.id}` for add/edit mode
- **Tables with actions**: Map rows, conditional action buttons per role, row-level operations
- **Form dialogs**: Form state, optional edit data pre-fill, reset on close/success
- **Stats cards**: Pre-computed aggregates passed from server, formatted display

### Styling
- Use Tailwind CSS utility classes with dark mode support (`dark:` prefix)
- Use `cn()` to merge conditionally applied classes
- Responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Component spacing: `gap-` for flex/grid, `px-`/`py-` for padding
- `../Uncodixfy.md` is mandatory for frontend styling choices; prefer plain, functional UI over decorative AI-default patterns

## Dependencies

### Internal
- `actions/` — Server actions for CRUD operations
- `lib/utils` — `cn()` for Tailwind class merging
- `lib/auth` — `getCurrentUser()` for role checks
- `types/` — Shared TypeScript types
- `ui/` — shadcn/ui primitives

### External
- React 19 — `useState`, `useTransition`, `useRouter`, `useCallback`, `useMemo`
- Next.js — `next/navigation` for routing
- Tailwind CSS — Utility-first styling
- Radix UI (via shadcn/ui) — Accessible component primitives
- @phosphor-icons/react — Icon library
- recharts — Charts (lazy-loaded with `next/dynamic`)
- date-fns — Date utilities
- class-variance-authority — Component variants
