<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-24 | Updated: 2026-02-24 -->

# components/check-in

## Purpose
Guest arrival and departure workflows. Check-in processes reservations into occupied rooms. Check-out completes reservations and marks rooms for cleaning.

## Files
| File | Component | Description |
|------|-----------|-------------|
| `check-in-client.tsx` | CheckInClient | Orchestrator for guest check-in flow |
| `check-out-client.tsx` | CheckOutClient | Orchestrator for guest check-out flow |

## Component Details

### CheckInClient (check-in-client.tsx)
- **Props**: `pendingReservations`, `guests`, `rooms`, `userRole`
- **Features**:
  - List pending reservations (status: CONFIRMED, not yet checked in)
  - Search and filter by guest name, reservation ID
  - Check-in wizard dialog with steps:
    1. Guest confirmation (display guest info, allow edit)
    2. Room assignment (select available room or current reserved room)
    3. Special requests / notes
  - Update reservation status to CHECKED_IN
  - Update room status to OCCUPIED
  - Empty state when all guests checked in

### CheckOutClient (check-out-client.tsx)
- **Props**: `occupiedReservations`, `rooms`, `userRole`
- **Features**:
  - List checked-in guests (status: CHECKED_IN)
  - Search and filter by guest name, room number
  - Check-out wizard dialog with steps:
    1. Confirm guest details
    2. Room inspection / damage notes (optional)
    3. Final charges / additional items
  - Update reservation status to CHECKED_OUT
  - Update room status to CLEANING
  - Create housekeeping task for room cleaning
  - Empty state when no guests checked in

## For AI Agents

### Working In This Directory
- Both components are client-side (`"use client"`)
- Data flows in via props from server page
- State management: `useState` for search, wizard step, selected reservation
- Mutations call server actions: `checkInReservation()`, `checkOutReservation()`
- After mutation, call `router.refresh()` to update
- Use `useTransition()` for loading state during mutation

### Common Patterns
- **Wizard pattern**: useState for step number, conditional render based on step
- **Search/filter**: Filter array by guest name or ID
- **Status rendering**: Display current reservation status with badge
- **Confirmation**: Show key guest details before completing action

### Styling
- Card-based layout with rounded borders
- Table for reservation list (guest name, dates, room, status)
- Modal dialog for check-in/check-out wizard
- Action buttons: Check-in/Check-out, Cancel
- Icons: SignIn, SignOut, ArrowRight from @phosphor-icons/react

## Dependencies

### Internal
- `actions/reservations` — updateReservationStatus
- `actions/rooms` — updateRoomStatus
- `actions/housekeeping` — createTask (for cleaning after check-out)
- `types/` — Reservation, Room, Guest types

### External
- React 19 — `useState`, `useRouter`, `useTransition`
- Next.js — Navigation, routing
- Tailwind CSS — Styling
