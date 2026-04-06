<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-24 | Updated: 2026-02-24 -->

# components/rooms

## Purpose
Room inventory management. Create, update, list rooms with grid or table view, manage room status, view room details and amenities.

## Files
| File | Component | Description |
|------|-----------|-------------|
| `rooms-client.tsx` | RoomsClient | Main list view with grid/table toggle, search, filters, add/edit buttons |
| `room-dialog.tsx` | RoomDialog | Create/edit dialog with room details (number, type, capacity, price, amenities) |
| `room-card.tsx` | RoomCard | Card component for grid view showing room summary |
| `room-table.tsx` | RoomTable | Table component for list view (uses SortIcon at module scope) |
| `room-status-badge.tsx` | RoomStatusBadge | Status badge component with color coding |

## Component Details

### RoomsClient (rooms-client.tsx)
- **Props**: `rooms`, `userRole`
- **Features**:
  - Header: Icon, title, filtered/total room count
  - View toggle: Grid (card) or Table (list)
  - Add button: Creates new room (admin/manager only)
  - Search: By room number
  - Filters:
    - Type: All, Single, Double, Suite, Deluxe, Family
    - Status: All, Available, Occupied, Cleaning, Maintenance, Reserved
    - Floor: All, 1-10
  - Clear filters button when active
  - **Grid view**: RoomCard components
  - **Table view**: RoomTable component
  - Empty state with icon and CTA
  - Responsive layout

### RoomDialog (room-dialog.tsx)
- **Props**: `open`, `onOpenChange`, `room?`, `hotels`, `defaultHotelId`, `userRole`
- **Features**:
  - Form fields: Room Number, Floor, Type (select), Capacity (number), Price Per Night, Status (select), Amenities (multi-select or textarea)
  - Hotel selector (if multiple hotels)
  - Dialog title: "Yeni Oda Ekle" (create) or "Odayı Düzenle" (edit)
  - Use `key={room?.id}` to reset form on open/close
  - Submit button calls server action
  - Validation: Room number unique, number fields numeric

### RoomCard (room-card.tsx)
- **Props**: `room`, `onClick`
- **Features**:
  - Room number as title (large font)
  - Status badge: Color-coded
  - Type label
  - Capacity (beds icon + count)
  - Price per night
  - Quick amenities list (icons or text)
  - Floor number
  - Click handler for edit (if manager/admin)
  - Hover effect

### RoomTable (room-table.tsx)
- **Props**: `rooms`, `userRole`, `onEdit`
- **Features**:
  - Table columns: Room Number, Floor, Type, Capacity, Status, Price, Amenities, Actions
  - SortIcon at module scope for sort indicators
  - Sortable columns: Number, Floor, Type, Capacity, Price
  - Status badge: Color-coded
  - Row hover highlight
  - Actions: View, Edit, Delete (admin/manager only)
  - Alternating row colors

### RoomStatusBadge (room-status-badge.tsx)
- **Props**: `status` (AVAILABLE, OCCUPIED, CLEANING, MAINTENANCE, RESERVED)
- **Features**:
  - Color-coded badge:
    - AVAILABLE: Green
    - OCCUPIED: Blue
    - CLEANING: Amber
    - MAINTENANCE: Red
    - RESERVED: Purple
  - Icon + text (e.g., "Müsait", "Dolu")

## For AI Agents

### Working In This Directory
- RoomsClient is client-side (`"use client"`)
- View toggle (grid/table) with `useState`
- Filter state: search, type, status, floor
- Filtered array computed with `useMemo` to avoid recalculation
- Dialog controlled by `open` and `editRoom` state
- Use `key={editRoom?.id}` pattern for add/edit dialog reset
- Mutations call server actions: createRoom, updateRoom, deleteRoom
- Use `useTransition()` for loading state

### Common Patterns
- **View toggle**: Two button style toggle with active variant
- **Grid layout**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- **Filter memoization**: Use `useMemo` to avoid filtering on every render
- **Status colors**: AVAILABLE green, OCCUPIED blue, CLEANING amber, MAINTENANCE red, RESERVED purple
- **Add/edit with key**: `<RoomDialog key={editRoom?.id} room={editRoom} />`

### Styling
- Header: Title + subtitle with count, view toggle and add button
- Cards: Rounded border, shadow, hover lift
- Status badge: Color-coded, positioned top-right
- Type/amenities: Secondary text, smaller font
- Price: Large font, primary color
- Table: Responsive with sticky header
- Icons: Bed, Squares (grid), List (table) from @phosphor-icons/react

## Dependencies

### Internal
- `actions/rooms` — createRoom, updateRoom, deleteRoom
- `types/` — Room, RoomType, RoomStatus types

### External
- React 19 — `useState`, `useRouter`, `useTransition`, `useMemo`
- Next.js — Navigation, routing
- Tailwind CSS — Styling
- @phosphor-icons/react — Icons (Bed, SquaresFour, List, Funnel, etc.)
