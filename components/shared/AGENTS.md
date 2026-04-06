<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-24 | Updated: 2026-02-24 -->

# components/shared

## Purpose
Reusable utility components used across feature modules. Currency display with formatting and conversion, loading skeleton placeholders for async content.

## Files
| File | Component | Description |
|------|-----------|-------------|
| `currency-display.tsx` | CurrencyDisplay | Formatted currency display with optional conversion and currency selector |
| `loading-skeleton.tsx` | LoadingSkeleton | Reusable skeleton placeholder components for async states |

## Component Details

### CurrencyDisplay (currency-display.tsx)
- **Props**: `amount`, `baseCurrency`, `showConversions`, `selectedCurrency`, `onCurrencyChange`
- **Features**:
  - Displays formatted currency amount with symbol
  - Base currency default: TRY (Turkish Lira)
  - Supported currencies: TRY (₺), USD ($), EUR (€)
  - Optional conversion display: Shows converted amounts for other currencies
  - Currency selector buttons (when `onCurrencyChange` provided)
  - Uses currency adapter from `@/patterns/adapter/currency-adapter`
  - Format: `Intl.NumberFormat` with currency style
  - Responsive flex layout
  - Icon: CurrencyCircleDollar

### LoadingSkeleton (loading-skeleton.tsx)
- **Exports** (multiple skeleton components):
  - `SkeletonCard`: Full-height card placeholder with shimmer animation
  - `SkeletonRow`: Table row placeholder with multiple columns
  - `SkeletonText`: Text line placeholder (adjustable width)
  - `SkeletonAvatar`: Circular avatar placeholder
  - `SkeletonButton`: Button-sized placeholder
  - `SkeletonChart`: Large chart placeholder
- **Features**:
  - Animated shimmer effect (background gradient movement)
  - Responsive sizing
  - Used in Suspense fallback components
  - Tailwind-based styling with `animate-pulse`

## For AI Agents

### Working In This Directory
- Both components are client-side (`"use client"`)
- CurrencyDisplay uses adapter pattern for currency conversion
- LoadingSkeleton components are simple styled divs with animation
- No state management needed
- CurrencyDisplay can be used standalone or as child in other components

### Common Patterns
- **Currency formatting**: Pass amount and base currency, display formatted
- **Currency conversion**: `adapter.convert(amount, fromCurrency, toCurrency)`
- **Skeleton loading**: Import specific skeleton component needed for layout
- **Fallback UI**: Use skeleton components in Suspense boundaries

### Styling
- CurrencyDisplay: Flex column layout, icon + amount, optional conversion text
- Skeleton: Gray background with animated shimmer, rounded corners
- Shimmer animation: `animate-pulse` or custom keyframe animation
- Responsive: Mobile-friendly sizing

## Dependencies

### Internal
- `patterns/adapter/currency-adapter` — getCurrencyAdapter()
- `lib/utils` — `cn()` for class merging
- `types/` — Currency type definitions

### External
- React 19 — Functional component API
- Tailwind CSS — Styling and animation
- Intl API — Number formatting with currency
- @phosphor-icons/react — CurrencyCircleDollar icon
