# Testing

## Current Tooling Posture
- `package.json` defines `dev`, `build`, `start`, and `lint` scripts only.
- There is no `test` script in `package.json`.
- There is no dedicated typecheck script even though `AGENTS.md` recommends `npx tsc --noEmit`.
- ESLint is configured in `eslint.config.mjs`.

## Automated Test Files Present
- No `*.test.*` or `*.spec.*` files were found in the repository tree.
- No `__tests__/` directory was found.
- No Playwright, Vitest, Jest, or Cypress config files were found in inspected root files.

## Practical Verification Options
- The most realistic built-in validations are linting, building, Prisma generation, and manual smoke testing.
- Type safety depends on running `npx tsc --noEmit`, but that command is documented rather than scripted.
- Seed-data verification can be done through `prisma/seed.ts` plus runtime UI checks.

## Existing Quality Signals
- Strict TypeScript mode is enabled in `tsconfig.json`.
- Next.js ESLint presets are enabled in `eslint.config.mjs`.
- Server actions and pages follow repeated patterns that make future tests straightforward to organize by feature.

## Likely Test Seams
- Action modules under `actions/` are natural candidates for integration-style tests around auth, validation, and Prisma behavior.
- Pattern modules under `patterns/state/` and `patterns/adapter/` are good unit-test targets because they have clear inputs and outputs.
- Complex UI orchestration components such as `components/reservations/reservation-wizard.tsx` are candidates for interaction tests.

## Current Gaps
- No automated regression coverage exists for reservation overlap checks in `actions/reservations.ts`.
- No automated coverage exists for room state transitions in `actions/rooms.ts` and `patterns/state/room-state.ts`.
- No automated coverage exists for billing calculations in `actions/billing.ts`.
- No smoke tests exist for auth middleware behavior in `middleware.ts`.

## Recommended Baseline If Test Work Starts
- Add a `typecheck` script wrapping `tsc --noEmit`.
- Add a test runner and start with unit coverage for `patterns/state/` and `patterns/adapter/`.
- Add server-action tests for high-risk flows: auth, reservation creation, billing, and room status changes.
- Add a small end-to-end smoke path covering login, dashboard load, and one CRUD mutation.
