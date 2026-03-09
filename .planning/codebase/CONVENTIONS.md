# Conventions

## Language and Style
- Code is written in TypeScript with `strict: true` in `tsconfig.json`.
- UI copy is primarily Turkish, while identifiers and file names are English, visible in `app/(auth)/login/page.tsx` and `actions/dashboard.ts`.
- Import aliases use the `@/` prefix configured in `tsconfig.json`.

## Route and Component Pattern
- Most dashboard pages follow a server-page pattern: fetch on the server, render a client entry component.
- This pattern is documented in `app/AGENTS.md` and demonstrated by `app/(dashboard)/page.tsx`.
- Client entry components typically sit in the matching feature folder and carry a `*-client.tsx` suffix such as `components/rooms/rooms-client.tsx`.

## Action Pattern
- Server action files place `"use server"` at file top, e.g. `actions/rooms.ts` and `actions/billing.ts`.
- Auth is checked early with `getCurrentUser()`.
- Mutation-capable actions usually call `revalidatePath()` after writes.
- Most actions return a result object with `success`, optional `data`, and optional `error` instead of throwing to the caller.

## Client Interaction Pattern
- Client components manage local filters and UI state with hooks such as `useState`, `useMemo`, `useEffect`, and `useTransition`.
- Navigation-aware components use `useRouter()` and often call `router.refresh()` after successful mutations, as seen in `components/reservations/reservation-wizard.tsx`.
- Dialog and edit flows commonly keep a selected record in state and pass it into a modal component, as seen in `components/rooms/rooms-client.tsx`.

## Data Formatting Pattern
- Dates and currency are formatted for Turkish locale in multiple components, including `components/shared/currency-display.tsx` and `components/layout/header.tsx`.
- Currency conversion is funneled through the adapter in `patterns/adapter/currency-adapter.ts` instead of hand-coded exchange logic in each component.

## Error Handling Pattern
- Most server actions use broad `try/catch` blocks and convert failures into Turkish error strings.
- Many catches intentionally swallow the underlying exception, for example in `actions/dashboard.ts`, `actions/reservations.ts`, and `lib/auth.ts`.
- A smaller subset inspects the caught error for a known case, such as unique constraint handling in `actions/rooms.ts`.

## Styling Pattern
- Tailwind utility classes are the default styling mechanism.
- Theme tokens and reusable utility classes are centralized in `app/globals.css`.
- The app uses local shadcn/ui wrappers from `components/ui/` instead of importing raw primitives directly into feature modules.

## Domain Modeling Pattern
- Shared business unions live in `types/index.ts`.
- More advanced business rules are encapsulated as explicit patterns in `patterns/state/` and `patterns/adapter/`.
- Prisma model fields sometimes remain loose strings even when matching unions exist in `types/index.ts`, so type alignment is not fully enforced at the database layer.
