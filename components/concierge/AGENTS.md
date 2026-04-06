<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-24 | Updated: 2026-02-24 -->

# components/concierge

## Purpose
Guest service request orchestration. Create, track, assign, and complete guest requests (room service, maintenance, special requests, etc.).

## Files
| File | Component | Description |
|------|-----------|-------------|
| `concierge-client.tsx` | ConciergeClient | Orchestrator with filters, table, dialogs for create/edit/assign/status |
| `concierge-filters.tsx` | ConciergeFilters | Filter controls: search, status, type, priority |
| `concierge-stats.tsx` | ConciergeStats | Summary stats: Total, Pending, In Progress, Completed |
| `concierge-table.tsx` | ConciergeTable | Responsive table with request details and row actions |
| `service-request-dialog.tsx` | ServiceRequestDialog | Create/edit dialog for service requests |
| `assign-dialog.tsx` | AssignDialog | Assign request to staff member |
| `status-update-dialog.tsx` | StatusUpdateDialog | Update request status (Pending → In Progress → Completed) |

## Component Details

### ConciergeClient (concierge-client.tsx)
- **Props**: `requests`, `guests`, `staff`, `hotelId`, `userRole`
- **Features**:
  - State: search, filters (status, type, priority), dialog controls
  - Calculate stats from requests array
  - Filter requests by multiple criteria
  - Multiple dialogs: create, edit, assign, status update
  - Open state managed by modal ID
  - Delete with confirmation
  - Router refresh after mutations

### ConciergeFilters (concierge-filters.tsx)
- **Props**: `search`, `statusFilter`, `typeFilter`, `priorityFilter`, callbacks
- **Features**:
  - Search input by guest name
  - Status select: PENDING, IN_PROGRESS, COMPLETED
  - Type select: ROOM_SERVICE, MAINTENANCE, LAUNDRY, SPECIAL_REQUEST, etc.
  - Priority select: LOW, MEDIUM, HIGH, URGENT
  - Callback on each filter change

### ConciergeStats (concierge-stats.tsx)
- **Props**: `total`, `pending`, `inProgress`, `completed`
- **Features**:
  - 4-column stat cards: Total Requests, Pending, In Progress, Completed
  - Responsive layout (grid)
  - Color-coded cards

### ConciergeTable (concierge-table.tsx)
- **Props**: `filtered`, `hasActiveFilters`, `isPending`, `deleteId`, `userRole`, callbacks
- **Features**:
  - Responsive table: Guest name, Type, Priority, Status, Assigned To, Created Date
  - Row actions: Assign, Update Status, Edit, Delete
  - Empty state with icon when no requests
  - Loading indicator during mutation

### ServiceRequestDialog (service-request-dialog.tsx)
- **Props**: `open`, `onOpenChange`, `guests`, `hotelId`, `editRequest?`, `onSuccess`
- **Features**:
  - Guest selector
  - Request type select
  - Description textarea
  - Priority select
  - Notes field
  - Submit button calls server action
  - In edit mode, pre-fills form with request data

### AssignDialog (assign-dialog.tsx)
- **Props**: `open`, `onOpenChange`, `requestId`, `currentAssignedId`, `staff`, `onSuccess`
- **Features**:
  - Staff member selector
  - Submit calls server action with staff ID
  - Shows current assignee

### StatusUpdateDialog (status-update-dialog.tsx)
- **Props**: `open`, `onOpenChange`, `requestId`, `currentStatus`, `hasAssignee`, `onSuccess`
- **Features**:
  - Status select with available transitions
  - Notes field for completion reason
  - Submit calls server action with new status

## For AI Agents

### Working In This Directory
- All components are client-side (`"use client"`)
- ConciergeClient is the orchestrator parent
- Child components receive props for state and callbacks
- Filter state managed in ConciergeClient, passed down
- Dialogs controlled by parent state (open ID)
- Mutations call server actions and trigger `router.refresh()`
- Use `useTransition()` for loading state

### Common Patterns
- **Orchestrator pattern**: Parent manages all state, passes to children
- **Dialog ID tracking**: Instead of `isOpen`, track `assignRequestId` to know which dialog
- **Filtered array**: Compute filtered requests once, pass to table
- **Empty state**: Show icon + message when no results

### Styling
- Stats cards: 4-column responsive grid
- Table: Responsive with hidden columns on small screens
- Badges: Color-coded by status (pending: amber, in progress: blue, completed: green)
- Icons: CallBell, Plus, Eye, ArrowRight from @phosphor-icons/react

## Dependencies

### Internal
- `actions/concierge` — createServiceRequest, updateServiceRequest, deleteServiceRequest, assignServiceRequest, updateServiceRequestStatus
- `types/` — ServiceRequest, Guest, StaffMember types

### External
- React 19 — `useState`, `useTransition`, `useRouter`
- Next.js — Navigation, routing
- Tailwind CSS — Styling
