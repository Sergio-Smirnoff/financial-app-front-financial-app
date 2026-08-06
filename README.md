# financial-app — Frontend

Next.js 15 frontend. Talks exclusively to the API gateway on port 8080.

**Port:** 3000  
**Gateway:** `NEXT_PUBLIC_GATEWAY_URL` (default `http://localhost:8080`)

> Full design: `docs/specs/services/frontend.md` (parent workspace).

---

## Tech Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · TanStack Query · Zustand · Recharts

---

## Folder Tree

```
front/financial-app/
├── app/
│   ├── layout.tsx                  # Root: ThemeProvider + QueryProvider + Toaster
│   ├── globals.css
│   ├── (auth)/
│   │   ├── layout.tsx              # Centered, no sidebar
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── (dashboard)/
│       ├── layout.tsx              # Sidebar + NotificationProvider
│       ├── page.tsx                # / → Dashboard
│       ├── banks/page.tsx
│       ├── transactions/page.tsx
│       ├── categories/page.tsx
│       ├── loans/page.tsx
│       ├── investments/page.tsx
│       ├── imports/page.tsx
│       ├── design-preview/page.tsx # Temporary Nocturne design token validation page
│       └── settings/page.tsx
├── components/
│   ├── layout/                     # Header, Sidebar, MobileSidebar, NotificationBell, ThemeToggle
│   ├── pages/                      # Domain-scoped components (banks/, dashboard/, investments/, ...)
│   ├── shared/                     # App-wide building blocks (ConfirmDialog, Surface, QueryBoundary, ...)
│   └── ui/                         # shadcn/ui primitives
├── lib/
│   ├── api/                        # Domain API modules + client.ts + config.ts
│   ├── hooks/                      # TanStack Query hooks (use*.ts)
│   ├── schemas/                    # Zod form schemas
│   ├── store/                      # Zustand stores
│   └── utils/                      # Pure utilities (currency, dates, cbu, ...)
├── providers/
│   ├── QueryProvider.tsx
│   ├── ThemeProvider.tsx
│   └── NotificationProvider.tsx    # Mounts useNotificationSSE
├── types/                          # TypeScript interfaces per domain
└── middleware.ts                   # Route gating on user_info cookie
```

---

## Pages

| Route group | Layout | Pages |
|---|---|---|
| `(auth)` | Full-screen centered, no sidebar | `/login`, `/register` |
| `(dashboard)` | Fixed sidebar + scrollable content | `/` (dashboard), `/banks`, `/transactions`, `/categories`, `/loans`, `/investments`, `/imports`, `/settings` |

---

## Key Client Behavior

### middleware.ts

Runs on every non-static request. Reads the `user_info` cookie (non-HttpOnly, written by the backend on login, carries `id|email|firstName` URL-encoded):

| Condition | Action |
|---|---|
| No `user_info` + protected route | Redirect to `/login` |
| Has `user_info` + auth route | Redirect to `/` |
| Otherwise | Pass through |

The middleware never calls the gateway.

### apiFetch (`lib/api/client.ts`)

All HTTP calls flow through `apiFetch`. Domain modules in `lib/api/*.ts` build typed wrappers around it.

| Concern | Behavior |
|---|---|
| Base URL | `NEXT_PUBLIC_GATEWAY_URL` via `API_CONFIG.BASE_URL` |
| Credentials | `credentials: 'include'` on every request |
| CSRF | Reads `XSRF-TOKEN` cookie; sends as `X-XSRF-TOKEN` on all non-GET/HEAD requests |
| Response unwrap | Parses `ApiResponse<T>`; returns `body.data` directly, throws `ApiError` on failure |
| 401 handling | Token refresh then retry with mutex (one refresh in-flight at a time); on failure redirects to `/login` |

The refresh mutex is a module-level `Promise<boolean> | null`. Concurrent 401s all await the same promise so only one refresh call is ever made.

---

## Recent UX Fixes (2026-06-12)

| Area | Fix |
|---|---|
| Investments — Markets tab | Ticker research renders inline below the search box; the `/investments/research/[ticker]` route was removed. `TickerSearchBox` now takes an `onSelect` callback instead of navigating. |
| Transactions table | Sentinel CBUs render operation labels: `Brokerage` for broker sentinel CBUs, `External` for the `0000000000000000000000` installment sentinel. User-entered CBUs still render raw. |
| `PriceChart` | Points with a non-positive price are silently ignored, preventing a drop-to-zero spike on pre-open or no-trade candles. |
| Card list | Layout no longer clips the Expires / behavior row. |
| Notifications dialog | The close button no longer overlaps the "Mark all as read" action. |

---

## Run

```bash
# Recommended: starts infra + frontend
./scripts/dev.sh front

# Standalone
cd front/financial-app
npm run dev          # Turbopack
npm run build
npm run lint
npm run test:run     # Vitest unit test suite
npm run e2e          # Playwright end-to-end journeys
npm run i18n:check   # Key completeness validator (es-AR vs en)
```

Reads `NEXT_PUBLIC_GATEWAY_URL` (default `http://localhost:8080`). Copy `.env.local.example` to `.env.local` to override.

## CI/CD

| Workflow | Trigger | Does |
|---|---|---|
| `ci.yml` | PRs; push to develop/master | lint + build + docker build via shared `frontend-ci.yml` |
| `docker-publish.yml` | push to master; `v*` tags | GHCR publish: `latest`, `sha-*`, semver on tags |
| `release.yml` | manual (bump dropdown) | next `vX.Y.Z` tag + Release + versioned publish |

Reusable workflows live in the root repo `Sergio-Smirnoff/financial-app`.
