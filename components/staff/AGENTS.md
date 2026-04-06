<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-24 | Updated: 2026-02-24 -->

# components/staff

## Purpose
Staff member management. Create, update, list staff with role assignment, view staff directory and assignment history.

## Files
| File | Component | Description |
|------|-----------|-------------|
| `staff-client.tsx` | StaffClient | Main list view with search, add/edit buttons, and table |
| `staff-dialog.tsx` | StaffDialog | Create/edit dialog with staff details (name, email, phone, role, status) |
| `staff-table.tsx` | StaffTable | Responsive table with staff details and row actions |

## Component Details

### StaffClient (staff-client.tsx)
- **Props**: `staff`, `userRole`
- **Features**:
  - Header: Icon, title, staff member count
  - Add button: Creates new staff member (admin/manager only)
  - Search: By name, email, or role
  - Responsive table with search results
  - Row actions: View, Edit, Deactivate/Activate, Delete (admin only)
  - Empty state with icon and CTA
  - Filtering: Active/Inactive status toggle
  - Loading state during mutations

### StaffDialog (staff-dialog.tsx)
- **Props**: `open`, `onOpenChange`, `staff?`, `onSuccess`
- **Features**:
  - Form fields: First Name, Last Name, Email, Phone, Role (select), Status (Active/Inactive)
  - Role options: ADMIN, MANAGER, RECEPTIONIST, HOUSEKEEPING, CONCIERGE
  - Dialog title: "Yeni Personel Ekle" (create) or "Personeli Düzenle" (edit)
  - Use `key={staff?.id}` to reset form on open/close
  - Email validation
  - Submit button calls server action
  - Password reset option for security

### StaffTable (staff-table.tsx)
- **Props**: `filtered`, `userRole`, callbacks
- **Features**:
  - Table columns: Name, Email, Phone, Role, Status, Assigned Tasks (optional), Actions
  - Role badge: Color-coded by role
  - Status badge: Active (green) / Inactive (gray)
  - Row hover highlight
  - Actions: View detail, Edit, Deactivate/Activate, Delete (admin only)
  - Responsive: Hidden columns on small screens (phone on sm:, tasks on lg:)
  - Alternating row colors
  - Avatar with initials

## For AI Agents

### Working In This Directory
- StaffClient is client-side (`"use client"`)
- Search filtering happens client-side on staff array
- Dialog controlled by `open` and `editStaff` state
- Use `key={editStaff?.id}` pattern for add/edit dialog reset
- Mutations call server actions: createStaff, updateStaff, deleteStaff, deactivateStaff
- Use `useTransition()` for loading state
- Role-based permission checks: Only ADMIN and MANAGER can edit/delete

### Common Patterns
- **Role display**: Map role constant to Turkish label
- **Status badge**: Active green, Inactive gray
- **Add/edit with key**: `<StaffDialog key={editStaff?.id} staff={editStaff} />`
- **Permission checks**: Show/hide actions based on `userRole`
- **Search filter**: Name, email, role substring match

### Styling
- Header icon: User icon in rounded box with primary background
- Avatar: Initials in circle, primary background
- Role badge: Color-coded (ADMIN: red, MANAGER: orange, RECEPTIONIST: blue, HOUSEKEEPING: amber, CONCIERGE: purple)
- Status badge: Green for active, gray for inactive
- Table: Responsive with hover effect
- Icons: UserCircleGear, Plus, Eye, PencilSimple, Trash from @phosphor-icons/react

## Dependencies

### Internal
- `actions/staff` — createStaff, updateStaff, deleteStaff, deactivateStaff
- `types/` — Staff, UserRole types

### External
- React 19 — `useState`, `useRouter`, `useTransition`
- Next.js — Navigation, routing
- Tailwind CSS — Styling
- @phosphor-icons/react — Icons
