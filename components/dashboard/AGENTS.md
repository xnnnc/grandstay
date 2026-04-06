<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-24 | Updated: 2026-02-24 -->

# components/dashboard

## Purpose
Dashboard overview with role-specific layouts. Displays key metrics, occupancy trends, recent activities, and quick actions. Charts are lazy-loaded with next/dynamic to reduce initial bundle.

## Files
| File | Component | Description |
|------|-----------|-------------|
| `dashboard-client.tsx` | DashboardClient | Main orchestrator with role-specific layouts (ADMIN, MANAGER, RECEPTIONIST/HOUSEKEEPING/CONCIERGE) |
| `stats-cards.tsx` | StatsCards | Grid of metric cards: Occupancy %, Revenue, Reservations, Rooms by Status |
| `occupancy-chart.tsx` | OccupancyChart | Lazy-loaded line chart showing occupancy trend (recharts) |
| `recent-activity.tsx` | RecentActivityList | List of recent guest/reservation/housekeeping activities |
| `hotels-summary.tsx` | HotelsSummaryGrid | Grid of hotel cards with key metrics (admin only) |

## Component Details

### DashboardClient (dashboard-client.tsx)
- **Props**: `userRole`, `userName`, `stats`, `occupancyData`, `recentActivities`, `hotelsSummary`
- **Features**:
  - Welcome banner with greeting and role label
  - **ADMIN layout**:
    - Welcome banner
    - Stats cards + Pending Reservations card
    - Hotels summary + Occupancy chart (2-column)
    - Recent activities
  - **MANAGER layout**:
    - Welcome banner
    - Stats cards
    - Occupancy chart + Recent activities (2-column)
    - Pending reservations card
  - **RECEPTIONIST/HOUSEKEEPING/CONCIERGE layout**:
    - Welcome banner
    - Stats cards (focused on today)
    - Recent activities (2/3 width) + Quick actions + Pending reservations (1/3 width)
  - `QuickActions()` helper: Links to new reservation, check-in, check-out, rooms

### StatsCards (stats-cards.tsx)
- **Props**: `stats`, `pendingReservationCard?`
- **Features**:
  - Responsive grid (2 columns mobile, 4 columns desktop)
  - Stat cards: Occupancy Rate, Total Revenue, Active Reservations, Rooms Available
  - Optional pending reservation card passed as prop
  - Large font for metric values, smaller label text

### OccupancyChart (occupancy-chart.tsx)
- **Props**: `data` (array of { date, occupancy })
- **Features**:
  - Lazy-loaded with `next/dynamic` to reduce bundle
  - recharts LineChart showing occupancy trend over time
  - X-axis: dates, Y-axis: occupancy percentage
  - Responsive container width
  - Card wrapper with title

### RecentActivityList (recent-activity.tsx)
- **Props**: `activities` (array of activity objects)
- **Features**:
  - Vertical list of activities with icons and timestamps
  - Activity types: guest check-in, reservation created, room status change, payment received
  - Color-coded by type
  - Relative time display (e.g., "2 hours ago")
  - Empty state when no activities

### HotelsSummaryGrid (hotels-summary.tsx)
- **Props**: `hotels` (array of { id, name, occupancy, revenue, reservations })
- **Features**:
  - Responsive grid of hotel cards (2-4 columns)
  - Each card: hotel name, occupancy %, revenue, pending reservations
  - Click to drill down to hotel dashboard
  - Empty state if no hotels

## For AI Agents

### Working In This Directory
- DashboardClient is client-side (`"use client"`)
- All data pre-computed on server and passed as props
- No data fetching in components
- Charts lazy-loaded: use `next/dynamic({ ssr: false })` for recharts
- Time formatting with date-fns for relative times
- Role-based conditional rendering in DashboardClient

### Common Patterns
- **Role-based layouts**: Check `userRole` and render different layouts
- **Stat display**: Large value, small label, optional trend indicator
- **Empty state**: Show placeholder when data empty
- **Responsive grids**: Use `grid-cols-2 sm:grid-cols-4` pattern

### Styling
- Welcome banner: Gradient background (`from-primary/5 via-primary/3 to-transparent`)
- Stat cards: 4-column responsive grid with rounded borders
- Charts: Lazy-loaded to reduce initial load
- Activity list: Vertical list with left icon, center content, right timestamp
- Icons: Various from @phosphor-icons/react

## Dependencies

### Internal
- `actions/dashboard` — getDashboardStats, getOccupancyData, getRecentActivities, getHotelsSummary
- `types/` — DashboardStats, OccupancyDataPoint, RecentActivity, HotelSummary, UserRole types

### External
- React 19 — `useState`
- Next.js — `next/dynamic` for lazy loading
- Tailwind CSS — Styling
- recharts — Charts (lazy-loaded)
- date-fns — Date/time formatting
- @phosphor-icons/react — Activity icons
