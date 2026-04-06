<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-24 | Updated: 2026-03-09 -->

# app

## Purpose
Next.js App Router directory. Contains route layouts, pages, and loading states. Uses route groups: `(auth)` for login, `(dashboard)` for protected pages.

## Key Files
| File | Description |
|------|-------------|
| `layout.tsx` | Root layout with fonts and global providers |
| `globals.css` | Tailwind CSS imports and CSS custom properties (theme) |
| `favicon.ico` | Site favicon |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `(auth)/` | Authentication routes (login page) |
| `(dashboard)/` | Protected dashboard routes with sidebar layout |

## For AI Agents

### Working In This Directory
- Pages are async Server Components that fetch data via actions or Prisma
- Each route has a `loading.tsx` with skeleton UI for Suspense fallback
- Pages delegate rendering to `*-client.tsx` components from `components/`
- Route groups `(auth)` and `(dashboard)` share different layouts
- `(dashboard)/layout.tsx` provides sidebar + header chrome
- For page layout, page structure, route-level styling, and visual hierarchy decisions, read and follow `../Uncodixfy.md`

### Common Patterns
- Page pattern: `async function Page() { const data = await action(); return <FeatureClient data={data} /> }`
- Every dashboard route has `loading.tsx` for instant navigation feedback
- Dynamic routes use `[id]` folders (e.g., `billing/[id]`, `guests/[id]`)
- Keep route shells and page layouts plain, functional, and non-decorative per `../Uncodixfy.md`

## Dependencies

### Internal
- `actions/` - Server actions for data fetching
- `components/` - Client components for rendering
- `lib/auth` - `getCurrentUser()` for auth
