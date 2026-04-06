<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-24 | Updated: 2026-02-24 -->

# components/layout

## Purpose
App shell components for dashboard chrome — sidebar navigation, header bar with hotel selector and user menu, auto-generating breadcrumbs from URL pathname.

## Files
| File | Component | Description |
|------|-----------|-------------|
| `sidebar.tsx` | AppSidebar | Left sidebar with role-filtered navigation, user info footer, collapsible icon mode |
| `header.tsx` | DashboardHeader | Sticky top bar with breadcrumb, hotel selector, notifications, user menu |
| `breadcrumb.tsx` | DashboardBreadcrumb | Auto breadcrumb generated from pathname using label map |

## Component Details

### AppSidebar (sidebar.tsx)
- **Props**: `userRole`, `userName`, `userEmail`
- **Features**:
  - Role-based navigation filtering (ADMIN, MANAGER, RECEPTIONIST, HOUSEKEEPING, CONCIERGE)
  - Grouped nav items (ANA, OPERASYONLAR, HİZMETLER, YÖNETİM, SİSTEM)
  - Collapsible to icon-only mode with `collapsible="icon"`
  - Optimistic transitions with `useTransition()` on link click
  - Active link detection with visual highlight
  - Badge support for item counts (e.g., notifications)
  - User footer with avatar and role label
  - Smooth transitions during navigation

### DashboardHeader (header.tsx)
- **Props**: `userName`, `userEmail`, `userRole`, `notificationCount`, `hotels`, `currentHotelId`, `onHotelChange`
- **Features**:
  - Sidebar trigger button to toggle sidebar
  - Hotel branch selector dropdown (only shown if multiple hotels)
  - Notification bell with count badge
  - User dropdown menu (Profile, Settings, Sign Out)
  - Responsive design (some text hidden on small screens)
  - Breadcrumb integration

### DashboardBreadcrumb (breadcrumb.tsx)
- **Props**: None (reads from `usePathname()`)
- **Features**:
  - Auto-generates breadcrumb from pathname segments
  - Turkish labels for known routes (rooms, reservations, guests, etc.)
  - Returns `Breadcrumb` component with links and separators
  - Current page shown as non-linked `BreadcrumbPage`
  - Falls back to title-cased segment for unknown routes

## For AI Agents

### Working In This Directory
- Sidebar and header are provided to dashboard layout in `app/(dashboard)/layout.tsx`
- All components are client-side (`"use client"`)
- Sidebar filtering is real-time based on `userRole` — no server dependency
- Breadcrumb generates automatically from pathname — no data needed
- Header hotel selector should call `onHotelChange?.(hotelId)` on selection
- Navigation uses optimistic transitions to show loading state during route change

### Common Patterns
- **Role-based rendering**: Check `userRole` against allowed roles for nav items
- **Navigation state**: Use `useRouter()` and `usePathname()` to detect active links
- **Optimistic UI**: Use `useTransition()` and state to show clicked item as active before route completes
- **Responsive design**: Hide items on small screens with `hidden sm:flex`

### Styling
- Sidebar: Uses `Sidebar` primitives from shadcn/ui with `group-data-[collapsible=icon]` for responsive style
- Header: Fixed sticky top bar with flex layout, gap-based spacing
- Icons: @phosphor-icons/react with size props (12-22px range)
- Colors: Primary for active/highlighted items, muted-foreground for secondary text

## Dependencies

### Internal
- `components/ui/` — Sidebar, Button, Avatar, Dropdown, Breadcrumb components
- `lib/utils` — `cn()` for class merging
- `types/` — UserRole type definition

### External
- React 19 — `useTransition`, `useRouter`, `usePathname`, `useState`, `useEffect`
- Next.js — Navigation components
- @phosphor-icons/react — Navigation icons
- Tailwind CSS — Layout and styling
