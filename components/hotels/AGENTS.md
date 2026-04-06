<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-24 | Updated: 2026-02-24 -->

# components/hotels

## Purpose
Hotel multi-property management. Create, update, list, and view hotel properties with occupancy, staff count, and operational metrics.

## Files
| File | Component | Description |
|------|-----------|-------------|
| `hotels-client.tsx` | HotelsClient | List view with search, grid/table toggle, add/edit buttons |
| `hotel-dialog.tsx` | HotelDialog | Create/edit dialog with hotel details (name, address, city, rooms, amenities) |
| `hotel-card.tsx` | HotelCard | Card component for grid view showing hotel summary |

## Component Details

### HotelsClient (hotels-client.tsx)
- **Props**: `hotels`, `userRole`
- **Features**:
  - Header: Icon, title, hotel count
  - View toggle: Grid (card) or Table (list)
  - Add button: Creates new hotel
  - Search: By hotel name or city
  - **Grid view**: HotelCard components showing occupancy, revenue, staff count, room count
  - **Table view**: Hotel name, city, rooms, occupancy %, staff count, actions
  - Row/card actions: View, Edit, Delete (admin only)
  - Empty state with icon
  - Hotel row clickable to view detail

### HotelDialog (hotel-dialog.tsx)
- **Props**: `open`, `onOpenChange`, `hotel?`, `onSuccess`
- **Features**:
  - Form fields: Name, Address, City, State/Province, Postal Code, Country, Rooms Count, Amenities
  - Dialog title: "Yeni Otel Ekle" (create) or "Oteli Düzenle" (edit)
  - Use `key={hotel?.id}` to reset form on open/close
  - Submit button calls server action
  - Validation: Name required, rooms count numeric

### HotelCard (hotel-card.tsx)
- **Props**: `hotel` (with occupancy, revenue, staffCount, roomCount metrics)
- **Features**:
  - Hotel name as title
  - Key metrics: Occupancy %, Revenue this month, Staff, Rooms
  - Color-coded occupancy bar
  - Click to view detail
  - Action buttons in card footer

## For AI Agents

### Working In This Directory
- HotelsClient is client-side (`"use client"`)
- View mode (grid/table) toggled with `useState`
- Search filtering happens client-side
- Grid view uses `useMemo` to avoid recalculation
- Mutations call server actions
- Use `key={hotel?.id}` pattern in HotelDialog for add/edit modes

### Common Patterns
- **View toggle**: Two button style toggle, conditional render based on state
- **Card layout**: Grid responsive with `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- **Occupancy visualization**: Bar or percentage display
- **Add/edit with key**: `<HotelDialog key={editHotel?.id} hotel={editHotel} />`

### Styling
- Header icon: Building icon in rounded box
- Card: Rounded border, shadow, hover lift effect
- Occupancy bar: Color gradient (red → amber → green) based on percentage
- Table: Responsive with city and occupancy % visible on all sizes
- Icons: Buildings, MapPin, Users, Bed from @phosphor-icons/react

## Dependencies

### Internal
- `actions/hotels` — createHotel, updateHotel, deleteHotel
- `types/` — Hotel type

### External
- React 19 — `useState`, `useRouter`, `useTransition`, `useMemo`
- Next.js — Navigation, routing
- Tailwind CSS — Styling
- @phosphor-icons/react — Icons
