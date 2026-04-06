<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-24 | Updated: 2026-02-24 -->

# components/reports

## Purpose
Business intelligence dashboards. Generate and visualize key business metrics: occupancy trends, revenue analysis, guest demographics, housekeeping efficiency, reservation analytics. All chart components are lazy-loaded with next/dynamic.

## Files
| File | Component | Description |
|------|-----------|-------------|
| `reports-client.tsx` | ReportsClient | Tab-based interface with filters (date range, hotel) and tab switching |
| `revenue-report.tsx` | RevenueReport | Lazy-loaded bar/line chart of revenue trends with summary stats |
| `reservation-report.tsx` | ReservationReport | Lazy-loaded chart showing reservation sources, booking windows, length of stay |
| `occupancy-report.tsx` | OccupancyReport | Lazy-loaded chart of occupancy rate by date with peak/low analysis |
| `housekeeping-report.tsx` | HousekeepingReport | Lazy-loaded chart of task completion rates and staff efficiency |
| `guest-stats-report.tsx` | GuestStatsReport | Lazy-loaded visualization of guest demographics, nationality, repeat guests |

## Component Details

### ReportsClient (reports-client.tsx)
- **Props**: `hotels`, `initialOccupancy`, `initialRevenue`, `initialGuests`, `initialHousekeeping`, `initialReservations`
- **Features**:
  - Filter card: Date range (start/end), Hotel selector (multi-hotel only)
  - Apply filters button with loading state
  - Tabs: Occupancy, Revenue, Guests, Housekeeping, Reservations
  - Each tab content rendered conditionally
  - On filter change, calls Promise.all to fetch all report data
  - Handles success/error states per tab
  - Uses `useTransition()` for loading state
  - Date range defaults to last 30 days

### RevenueReport (revenue-report.tsx)
- **Props**: `data` (revenue array with date, amount, currency)
- **Features**:
  - Lazy-loaded with `next/dynamic`
  - recharts BarChart or LineChart showing daily/monthly revenue
  - Summary stats: Total Revenue, Average Daily, Highest Day, Lowest Day
  - Currency selector if multi-currency
  - Responsive container
  - Color-coded by performance (green high, red low)

### ReservationReport (reservation-report.tsx)
- **Props**: `data` (reservation metrics)
- **Features**:
  - Lazy-loaded chart
  - Breakdown by source: Online, Phone, Walk-in, Travel Agency
  - Average length of stay
  - Peak booking window analysis
  - Conversion rate (inquiries → bookings)
  - Summary cards with key metrics

### OccupancyReport (occupancy-report.tsx)
- **Props**: `data` (occupancy array with date, rate, available, occupied)
- **Features**:
  - Lazy-loaded LineChart showing occupancy % over time
  - Target occupancy line (e.g., 80%)
  - Summary stats: Average occupancy, Peak occupancy, Lowest occupancy, Days above target
  - Color gradient: Red (low) → Yellow (medium) → Green (high)
  - Responsive responsive container

### HousekeepingReport (housekeeping-report.tsx)
- **Props**: `data` (task metrics)
- **Features**:
  - Lazy-loaded charts
  - Task completion rate by staff member
  - Average task duration by type
  - Tasks completed today vs. pending
  - Staff efficiency ranking
  - Summary: Total tasks, Completion %, Average time

### GuestStatsReport (guest-stats-report.tsx)
- **Props**: `data` (guest metrics)
- **Features**:
  - Lazy-loaded PieChart of guests by nationality
  - Repeat guest percentage
  - Average guest rating distribution
  - Guest acquisition source breakdown
  - Summary stats: Total guests, Repeat %, Average rating

## For AI Agents

### Working In This Directory
- ReportsClient is client-side (`"use client"`)
- All chart components are lazy-loaded: `next/dynamic({ ssr: false })`
- Filter state managed in ReportsClient: date range, hotel, active tab
- Mutations: `applyFilters()` calls Promise.all to fetch all report data
- Use `useTransition()` for loading state during filter apply
- Each report component receives pre-computed data from server action

### Common Patterns
- **Lazy loading**: All charts loaded with `next/dynamic` to reduce bundle
- **Error handling**: Show error message if report data fails to load
- **Empty state**: Show message if data empty (no transactions, etc.)
- **Date formatting**: ISO format for inputs, formatted display for charts
- **Summary stats**: Pre-compute aggregates on server, pass to components

### Styling
- Filter card: Simple layout with inputs and button
- Tabs: Full-width tab list with scroll on mobile
- Chart container: Responsive width, min-height for visibility
- Summary cards: 4-column grid, responsive
- Icons: ChartBar, TrendingUp from @phosphor-icons/react
- Colors: Primary for current data, muted for target/comparison

## Dependencies

### Internal
- `actions/reports` — getOccupancyReport, getRevenueReport, getGuestStats, getHousekeepingReport, getReservationAnalysis
- `types/` — Report data types

### External
- React 19 — `useState`, `useTransition`
- Next.js — `next/dynamic` for lazy loading
- recharts — Charts (lazy-loaded) - LineChart, BarChart, PieChart, ResponsiveContainer
- Tailwind CSS — Styling
- date-fns — Date formatting
- @phosphor-icons/react — Icons
