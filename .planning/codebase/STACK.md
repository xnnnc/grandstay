# Stack

## Runtime and Language
- Primary runtime is Node.js via Next.js scripts in `package.json`.
- Main language is TypeScript with strict mode enabled in `tsconfig.json`.
- React Server Components and client components coexist across `app/` and `components/`.
- Prisma client code is generated into `lib/generated/prisma/` from `prisma/schema.prisma`.

## Frameworks and UI
- Web framework is Next.js App Router from `next@16.1.6` in `package.json`.
- UI layer is React 19 from `react@19.2.3` and `react-dom@19.2.3`.
- Styling uses Tailwind CSS 4 with PostCSS configured in `postcss.config.mjs`.
- shadcn/ui configuration lives in `components.json` with `style: "radix-nova"` and CSS entry `app/globals.css`.
- Theme switching uses `next-themes` through `components/theme-provider.tsx` and `components/layout/header.tsx`.

## Data and Persistence
- Database provider is SQLite in `prisma/schema.prisma`.
- Prisma uses the `@prisma/adapter-better-sqlite3` adapter in `lib/db.ts`.
- The SQLite file path resolves to `dev.db` in `lib/db.ts` and `prisma/seed.ts`.
- Prisma config points to `prisma/schema.prisma` and `prisma/seed.ts` in `prisma.config.ts`.

## Libraries in Active Use
- Authentication/password hashing uses `bcryptjs` in `lib/auth.ts` and `actions/auth.ts`.
- Charts are lazy-loaded with `next/dynamic` in `components/dashboard/occupancy-chart.tsx` and report components under `components/reports/`.
- Icons come from `@phosphor-icons/react` across app and feature components such as `app/(auth)/login/page.tsx`.
- Class composition uses `clsx`, `tailwind-merge`, and likely `cn()` from `lib/utils.ts` referenced throughout AGENTS docs.
- UI primitives come from local wrappers in `components/ui/`.

## Build, Lint, and Dev Workflow
- Local development uses `npm run dev` from `package.json`.
- Production build and serve commands are `npm run build` and `npm run start`.
- Linting uses flat-config ESLint in `eslint.config.mjs` with Next core-web-vitals and TypeScript presets.
- No dedicated `test` or `typecheck` npm scripts are defined in `package.json`.

## Styling and Design System
- Global CSS tokens and custom utilities are defined in `app/globals.css`.
- The design system is based on CSS variables, OKLCH colors, and Tailwind utility classes in `app/globals.css`.
- The app uses light/dark theme tokens plus custom motion helpers such as `.header-shell` and `.dashboard-card` in `app/globals.css`.

## Notable Version Drift
- Repository docs in `AGENTS.md` still describe Next.js 15 and Prisma 6.
- Actual package versions in `package.json` are Next.js 16 and Prisma 7.
- Treat `package.json`, `tsconfig.json`, and Prisma config files as the source of truth over generated docs.
