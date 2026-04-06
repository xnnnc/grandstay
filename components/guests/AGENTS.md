<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-24 | Updated: 2026-02-24 -->

# components/guests

## Purpose
Guest master data management. Create, update, list, and view guest profiles with reservation history and contact information.

## Files
| File | Component | Description |
|------|-----------|-------------|
| `guests-client.tsx` | GuestsClient | List view with search, table, add/edit/delete buttons |
| `guest-dialog.tsx` | GuestDialog | Create/edit dialog with form fields (name, email, phone, ID, nationality) |
| `guest-detail.tsx` | GuestDetail | Detail page showing guest info and reservation history |
| `guest-reservation-badge.tsx` | GuestReservationBadge | Status badge for reservation state |

## Component Details

### GuestsClient (guests-client.tsx)
- **Props**: `guests`, `userRole`
- **Features**:
  - Header: Icon, title, guest count
  - Add button: Opens dialog in create mode
  - Search: By name, email, or ID number
  - Responsive table: Name + avatar, Email, Phone, ID (masked), Nationality flag, Last Reservation, Actions
  - Row actions: View (eye), Edit (pencil), Delete (trash, admin/manager only)
  - ID masking: Shows first 3 and last 3 digits, hides middle
  - Nationality flags: Map TR → 🇹🇷, GB → 🇬🇧, etc.
  - Empty state with icon
  - Guest row clickable to view detail

### GuestDialog (guest-dialog.tsx)
- **Props**: `open`, `onOpenChange`, `guest?`, `onSuccess`
- **Features**:
  - Form fields: First Name, Last Name, Email, Phone, ID Number, Nationality, Notes
  - Dialog title: "Yeni Misafir Ekle" (create) or "Misafiri Düzenle" (edit)
  - Use `key={guest?.id}` to reset form state on open/close
  - Submit button calls server action
  - Validation: ID number required, email format
  - Success callback calls `router.refresh()`

### GuestDetail (guest-detail.tsx)
- **Props**: `guestId`
- **Features**:
  - Guest header: Name, email, phone, ID number, nationality
  - Reservation history table: Hotel, Room, Check-in/Check-out, Status
  - Edit button to open dialog
  - Back link to guest list
  - Notes section if any

### GuestReservationBadge (guest-reservation-badge.tsx)
- **Props**: `status` (CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED)
- **Features**:
  - Color-coded badge: CONFIRMED blue, CHECKED_IN green, CHECKED_OUT gray, CANCELLED red
  - Compact size suitable for table cell

## For AI Agents

### Working In This Directory
- GuestsClient is client-side (`"use client"`)
- Search filtering happens in component (client-side)
- Delete and mutations call server actions
- Use `key={guest?.id}` pattern in GuestDialog for add/edit modes
- ID masking utility: `maskIdNumber(id: string) => first3 + "****" + last3`
- Nationality flags: Object map of country codes to flag emoji

### Common Patterns
- **Add/edit with key**: `<GuestDialog key={editGuest?.id} guest={editGuest} />`
- **Table row styling**: Alternating backgrounds with `idx % 2 === 0`
- **Avatar**: Initials in circle with background color
- **Delete confirmation**: Show dialog with guest full name before delete

### Styling
- Header icon: 10×10 rounded box with primary background
- Avatar: 8×8 or larger circles with initials, primary/10 background
- ID display: Monospace font, smaller text, muted color
- Table: Responsive with hidden columns (md: email, lg: phone, xl: last reservation)
- Nationality: Flag emoji + country code

## Dependencies

### Internal
- `actions/guests` — createGuest, updateGuest, deleteGuest
- `types/` — Guest, Reservation types

### External
- React 19 — `useState`, `useRouter`, `useTransition`
- Next.js — Navigation, routing
- Tailwind CSS — Styling
- @phosphor-icons/react — Icons (Users, Eye, Pencil, Trash, etc.)
