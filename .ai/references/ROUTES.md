# Frontend — Routes and Components

Route structure, layout hierarchy, middleware rules, and component areas.

## Route Groups and Layouts

```mermaid
graph TD
    ROOT["app/layout.tsx<br/>(ThemeProvider · QueryProvider · Toaster)"]
    ROOT --> AUTH["(auth)/layout.tsx<br/>centered · no sidebar"]
    ROOT --> DASH["(dashboard)/layout.tsx<br/>NotificationProvider · Sidebar"]
    AUTH --> LOGIN["/login"]
    AUTH --> REGISTER["/register"]
    DASH --> HOME["/ (Dashboard)"]
    DASH --> BANKS["/banks (Accounts, Cards, Loans tabs)"]
    DASH --> TXN["/transactions"]
    DASH --> CAT["/categories"]
    DASH --> LOANS["/loans"]
    DASH --> INV["/investments"]
    DASH --> IMPORTS["/imports"]
    DASH --> SETTINGS["/settings"]
```

## Route Map

| Path | Layout | Purpose |
|---|---|---|
| `/login` | `(auth)` | User login split form with remember-me support |
| `/register` | `(auth)` | Two-step user registration form with live password rules |
| `/` | `(dashboard)` | Overview dashboard (served via `/api/v1/bff/overview`) |
| `/banks` | `(dashboard)` | Accounts, cards, and loans management tabs (served via `/api/v1/bff/banks`: `kpis`, `accounts`, `cards`, `loans`, `importHealth`, `cashDistribution`, `paymentCalendar`) |
| `/transactions` | `(dashboard)` | Transaction history list, KPI summary, filters, and detail panel (served via `/api/v1/bff/transactions` sections `summary`, `page`, `filterOptions`, `uncategorised` & detail endpoint `/transactions/{id}`) |
| `/categories` | `(dashboard)` | Category budgets, progress rows, and rules with dry-run preview (served via `/api/v1/bff/categories`) |
| `/loans` | `(dashboard)` | Loan origination and installment payment history |
| `/investments` | `(dashboard)` | Investment holdings, portfolio P&L, and position detail (served via `/api/v1/bff/investments`) |
| `/imports` | `(dashboard)` | Import wizard, active run progress card, history table, and reconciliation check (served via `/api/v1/bff/imports`) |
| `/settings` | `(dashboard)` | User preferences, profile, security, notifications and fee schedules (served via `/api/v1/bff/settings`) |
| `/design-preview` | root | Gallery showcase of design system components and charts |

## Middleware (`middleware.ts`)

- Runs on all non-static paths (`matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)']`).
- Reads non-HttpOnly `user_info` cookie (written by backend on login). No gateway network calls are made.
- Redirects:
  - Missing `user_info` cookie + protected route → Redirects to `/login`.
  - Present `user_info` cookie + auth route (`/login`, `/register`) → Redirects to `/`.

## Component Areas

| Directory | Purpose |
|---|---|
| `components/charts/` | SVG charts: `AreaChart`, `BarPairChart`, `HorizonBars`, `CompositionBar`, `LegendList`, `Sparkline`, `primitives/` |
| `components/ui-kit/` | Wave 3 Design System UI kit: `money/`, `feedback/`, `shell/`, `overlay/`, `notifications/`, `layout/`, `controls/`, `table/`, `row/`, `data/`, `page/` (`banks/`, `investments/`, `imports/`) |
| `components/pages/` | Domain-scoped page content components |
| `components/shared/` | Legacy shared primitives |
| `components/ui/` | Headless shadcn/ui primitives (`button`, `dialog`, `select`, `tabs`, `input`, `form`, `badge`, `card`, `sonner`, etc.) |
