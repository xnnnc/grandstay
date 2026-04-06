<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-24 | Updated: 2026-02-24 -->

# components/billing

## Purpose
Invoice and payment management. List invoices with filtering and search, view invoice details, record payments, add line items.

## Files
| File | Component | Description |
|------|-----------|-------------|
| `billing-client.tsx` | BillingClient | Main list view with stats cards, search, filters, invoice table |
| `invoice-detail.tsx` | InvoiceDetail | Single invoice detail page with line items breakdown |
| `add-item-dialog.tsx` | AddItemDialog | Modal to add line items to an invoice |
| `payment-form.tsx` | PaymentForm | Form to record payment for an unpaid invoice |

## Component Details

### BillingClient (billing-client.tsx)
- **Props**: `invoices`, `stats`, `userRole`, `hotels`
- **Features**:
  - Summary stats cards: Total Revenue, Paid Count, Unpaid Count, Average Invoice
  - Search by guest name
  - Filter by payment status (Paid, Unpaid, All)
  - Filter by date range (from/to)
  - Hotel filter (admin only)
  - Responsive table: Guest name + avatar, Room number, Hotel, Amount, Currency, Status, Payment Method, Date
  - Row actions: View detail (eye icon)
  - Pagination handled by server (filtered array)
  - Empty state with icon when no invoices

### InvoiceDetail (invoice-detail.tsx)
- **Props**: `invoiceId`
- **Features**:
  - Invoice header: Number, guest name, dates, hotel, room
  - Line items table: Description, Quantity, Unit Price, Total
  - Subtotal, Tax, Total amount
  - Payment status with color coding
  - Payment method and date (if paid)
  - Action buttons: Add Item, Record Payment, Print, Delete
  - Back to list link

### AddItemDialog (add-item-dialog.tsx)
- **Props**: `invoiceId`, `open`, `onOpenChange`, `onSuccess`
- **Features**:
  - Form fields: Description, Quantity, Unit Price
  - Calculates line total
  - Submit button with loading state
  - Calls server action and refetches parent

### PaymentForm (payment-form.tsx)
- **Props**: `invoiceId`, `amount`, `onSuccess`
- **Features**:
  - Payment method selector: Cash, Credit Card, Bank Transfer
  - Payment date input
  - Notes field (optional)
  - Submit button with loading state
  - Calls server action to record payment

## For AI Agents

### Working In This Directory
- All components are client-side (`"use client"`)
- Data flows in via props from server page
- Filtering happens client-side on invoice array
- Mutations (add item, record payment, delete) call server actions
- After mutation, parent calls `router.refresh()` to update
- Currency formatting: Turkish Lira with `Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" })`

### Common Patterns
- **Status rendering**: `paidAt ? "Ödendi" : "Bekliyor"` with color-coded badge
- **Date formatting**: `toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })`
- **List filtering**: `invoices.filter(inv => { ... })` for search/status/hotel
- **Row styling**: Alternating row colors with `idx % 2 === 0 ? "" : "bg-muted/10"`

### Styling
- Summary cards: 4-column grid on sm+, 2-column on mobile
- Table: Responsive with hidden columns (md: room, lg: hotel, sm: method and date)
- Status badge: Green for paid, amber for unpaid
- Icons: MagnifyingGlass, Eye, CurrencyCircleDollar from @phosphor-icons/react

## Dependencies

### Internal
- `actions/billing` — createInvoice, updateInvoice, deleteInvoice, addLineItem, recordPayment
- `types/` — InvoiceItem type

### External
- React 19 — `useState`, `useRouter`, `useTransition`
- Next.js — Navigation, routing
- Tailwind CSS — Styling
- Intl API — Currency and date formatting
