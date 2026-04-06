<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-24 | Updated: 2026-02-24 -->

# components/reservations

## Purpose
Reservation booking and management. List reservations with search/filters, create new bookings with multi-step wizard, update reservation status and details.

## Files
| File | Component | Description |
|------|-----------|-------------|
| `reservations-client.tsx` | ReservationsClient | Orchestrator with filters, stats, table, and dialogs |
| `reservation-filters.tsx` | ReservationFilters | Filter controls: search, status, date range, hotel |
| `reservation-stats.tsx` | ReservationStats | Summary stats: Total, Confirmed, Checked-in, Checked-out, Cancelled |
| `reservation-table.tsx` | ReservationTable | Responsive table with reservation details and row actions |
| `reservation-wizard.tsx` | ReservationWizard | Multi-step booking form: Guest, Room, Dates, Special Requests, Confirmation |

## Component Details

### ReservationsClient (reservations-client.tsx)
- **Props**: `reservations`, `guests`, `rooms`, `stats`, `userRole`, `hotelId`
- **Features**:
  - Header with icon and reservation count
  - Create button: Opens wizard in new booking mode
  - Stats cards: Total, Confirmed, Checked-in, Checked-out, Cancelled
  - Filters: Search, Status, Date range, Hotel
  - Table with filtered results
  - Row actions: View, Edit, Cancel, Delete
  - Dialogs: New booking, Edit, Confirm cancellation

### ReservationFilters (reservation-filters.tsx)
- **Props**: Search, Status, Date filters + callbacks
- **Features**:
  - Search input: Guest name or reservation ID
  - Status select: ALL, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED
  - Date range inputs: Check-in from/to
  - Hotel selector (multi-hotel only)
  - Clear filters button

### ReservationStats (reservation-stats.tsx)
- **Props**: `stats` (total, confirmed, checkedIn, checkedOut, cancelled)
- **Features**:
  - 5-column stat card grid
  - Color-coded by status (confirmed blue, checked-in green, checked-out gray, cancelled red)
  - Responsive layout

### ReservationTable (reservation-table.tsx)
- **Props**: `filtered`, `hasActiveFilters`, `isPending`, callbacks
- **Features**:
  - Responsive table: Guest, Room, Hotel, Check-in, Check-out, Status, Nights, Total, Actions
  - Status badge: Color-coded
  - Guest avatar + name
  - Date range display
  - Row actions: View detail, Edit, Cancel, Delete
  - Empty state with icon and CTA
  - Loading indicator during mutation

### ReservationWizard (reservation-wizard.tsx)
- **Props**: `open`, `onOpenChange`, `guests`, `rooms`, `editReservation?`, `onSuccess`
- **Features**:
  - Multi-step form:
    1. **Guest selection**: Select existing guest or create new
    2. **Room & dates**: Select room, check-in date, check-out date
    3. **Special requests**: Notes, dietary restrictions, accessibility needs
    4. **Review & confirm**: Summary of reservation
  - Back/Next buttons to navigate steps
  - Submit button on final step
  - Cancel button throughout
  - Form validation at each step
  - In edit mode, pre-fills current reservation data
  - Calls server action and refreshes on success

## For AI Agents

### Working In This Directory
- ReservationsClient is client-side orchestrator
- Wizard component handles multi-step state with `useState(step)`
- Filter state in parent, passed to children
- Search filtering happens client-side on reservation array
- Mutations call server actions: createReservation, updateReservation, cancelReservation
- Use `useTransition()` for loading state
- Date inputs: ISO format (YYYY-MM-DD)

### Common Patterns
- **Multi-step form**: useState for step number, conditional render per step
- **Status colors**: CONFIRMED blue, CHECKED_IN green, CHECKED_OUT gray, CANCELLED red
- **Validation**: Check required fields before advancing step
- **Room availability**: Filter available rooms by date range
- **Nights calculation**: End date - Start date in days

### Styling
- Stats cards: 5-column responsive grid
- Table: Responsive with hidden columns (md: room, lg: hotel)
- Status badge: Color-coded by status
- Guest avatar: Initials in circle
- Wizard steps: Progress bar or step indicator at top
- Icons: CalendarCheck, Plus, Eye, ArrowRight from @phosphor-icons/react

## Dependencies

### Internal
- `actions/reservations` — createReservation, updateReservation, cancelReservation, checkAvailability
- `actions/guests` — createGuest, listGuests
- `types/` — Reservation, Guest, Room types

### External
- React 19 — `useState`, `useRouter`, `useTransition`
- Next.js — Navigation, routing
- Tailwind CSS — Styling
- date-fns — Date calculations and formatting
- @phosphor-icons/react — Icons
