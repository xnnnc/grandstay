<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-24 | Updated: 2026-02-24 -->

# components/housekeeping

## Purpose
Housekeeping task management. Create, assign, track, and complete cleaning and maintenance tasks. Staff can see assigned work and mark tasks as complete.

## Files
| File | Component | Description |
|------|-----------|-------------|
| `housekeeping-client.tsx` | HousekeepingClient | Orchestrator with filters, stats, task list, and dialogs |
| `housekeeping-filters.tsx` | HousekeepingFilters | Filter controls: status, type, priority, staff |
| `housekeeping-stats.tsx` | HousekeepingStats | Summary stats: Pending, In Progress, Completed Today, Rooms Needing Cleaning |
| `housekeeping-task-list.tsx` | HousekeepingTaskList | Card or list view of tasks with row actions |
| `housekeeping-task-card.tsx` | HousekeepingTaskCard | Single task card showing room, type, priority, status, assignee |
| `housekeeping-task-dialog.tsx` | HousekeepingTaskDialog | Create/edit dialog with room, type, priority, notes |
| `complete-task-dialog.tsx` | CompleteTaskDialog | Mark task complete with notes/signature |

## Component Details

### HousekeepingClient (housekeeping-client.tsx)
- **Props**: `tasks`, `rooms`, `staff`, `stats`, `userRole`, `hotelId`
- **Features**:
  - Header with icon and task count
  - Create button
  - Stats cards: Pending, In Progress, Completed Today, Rooms Needing Cleaning
  - Filters: Status, Type, Priority, Assigned Staff
  - Task list/table with filtered results
  - Delete with confirmation
  - Dialogs: Create, Edit, Complete
  - Loading state during mutations

### HousekeepingFilters (housekeeping-filters.tsx)
- **Props**: Status, Type, Priority, Staff filters + callbacks
- **Features**:
  - Status select: PENDING, IN_PROGRESS, COMPLETED
  - Type select: CLEANING, MAINTENANCE, REPAIR, INSPECTION
  - Priority select: LOW, MEDIUM, HIGH, URGENT
  - Staff select with "Unassigned" option
  - Callback on each filter change

### HousekeepingStats (housekeeping-stats.tsx)
- **Props**: `stats` (pendingCount, inProgressCount, completedTodayCount, roomsNeedingCleaning, roomsInMaintenance)
- **Features**:
  - 5-column stat card grid
  - Color-coded: pending amber, in-progress blue, completed green

### HousekeepingTaskList (housekeeping-task-list.tsx)
- **Props**: `filtered`, `hasActiveFilters`, `isPending`, `deleteId`, `startId`, callbacks
- **Features**:
  - List or card view of tasks
  - Each task shows: Room number, Type, Priority, Status, Assignee, Created Date
  - Row/card actions: Start/Mark In Progress, Complete, Assign, Edit, Delete
  - Empty state when no tasks
  - Loading indicator during mutation

### HousekeepingTaskCard (housekeeping-task-card.tsx)
- **Props**: `task`, `onStart`, `onComplete`, `onAssign`, `onEdit`, `onDelete`
- **Features**:
  - Room number as title
  - Task type and priority badges
  - Status with color coding
  - Assigned staff name or "Unassigned"
  - Created date/time
  - Action buttons (Start, Complete, Assign, Edit, Delete)

### HousekeepingTaskDialog (housekeeping-task-dialog.tsx)
- **Props**: `open`, `onOpenChange`, `rooms`, `staff`, `editTask?`, `onSuccess`
- **Features**:
  - Room selector
  - Task type select
  - Priority select
  - Staff selector (optional)
  - Notes textarea
  - Use `key={editTask?.id}` for add/edit mode

### CompleteTaskDialog (complete-task-dialog.tsx)
- **Props**: `open`, `onOpenChange`, `task`, `onSuccess`
- **Features**:
  - Show task details for confirmation
  - Completion notes field
  - Photo upload (optional)
  - Submit calls server action to mark complete

## For AI Agents

### Working In This Directory
- HousekeepingClient is client-side orchestrator
- All child components receive props
- Filtering state in parent, passed to children
- Dialog ID tracking (createOpen, editTask, completeTask)
- Mutations call server actions: createTask, updateTask, deleteTask, assignTask, completeTask
- Use `useTransition()` for loading state

### Common Patterns
- **Status workflow**: PENDING → IN_PROGRESS → COMPLETED
- **Priority colors**: LOW gray, MEDIUM amber, HIGH orange, URGENT red
- **Task type icons**: Broom, Wrench, Hammer, Clipboard
- **Unassigned filter**: Special value "__unassigned__" for filtering

### Styling
- Stats cards: 5-column responsive grid
- Task cards: Rounded border, priority color accent on left
- Status badge: Color-coded (pending: amber, in-progress: blue, completed: green)
- Priority badge: Color-coded by severity
- Room display: Large font, secondary text for floor/type
- Icons: Broom, Plus, Eye, ArrowRight from @phosphor-icons/react

## Dependencies

### Internal
- `actions/housekeeping` — createTask, updateTask, deleteTask, assignTask, completeTask
- `types/` — HousekeepingTask, Room, StaffMember types

### External
- React 19 — `useState`, `useTransition`, `useRouter`
- Next.js — Navigation, routing
- Tailwind CSS — Styling
- @phosphor-icons/react — Icons
