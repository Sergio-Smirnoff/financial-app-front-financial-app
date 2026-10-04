# Frontend — UI and Server State Management

State management decision rules: Server state vs Local UI state.

## State Decision Rule

| State Type | Library | Location | Pattern |
|---|---|---|---|
| **Server State** | TanStack Query v5 | `lib/hooks/use*.ts` | `useQuery` for reads; `useMutation` + `queryClient.invalidateQueries` on write success |
| **URL State** | nuqs | Component / Page | `useQueryState` / `useQueryStates` wrapped in `<NuqsAdapter>` Pages with several URL filters share one parser map (`useQueryStates(map)`) across components, e.g. `transactionFilterParams.ts`. |
| **Global UI State** | Zustand | `lib/store/ui.store.ts` | Modal visibility, confirm dialogs, mobile sidebar open/close |
| **Form State** | React Hook Form | Page / Component | `react-hook-form` + `zod` resolvers (`lib/schemas/`) |
| **Theme / SSE** | React Context | `providers/` | `ThemeProvider` (next-themes), `NotificationProvider` (mounts SSE) |

## Four-State Section Matrix (`lib/hooks/useSection.ts`)

BFF endpoints deliver sections wrapped in `{ status: 'OK' | 'UNAVAILABLE', observedAt: string, data: T }`. `useSection(section, isLoading)` normalizes this into four explicit states:

1. `loading`: Data is fetching or section undefined.
2. `unavailable`: `section.status === 'UNAVAILABLE'`. Section failed gracefully, rest of page works.
3. `empty`: `data` is empty array or `null`.
4. `ready`: `data` is populated and valid.

## TanStack Query Hooks (`lib/hooks/`)

- `useSection.ts`: Section status matrix helper (`loading`, `unavailable`, `empty`, `ready`).
- `useBanks.ts`: Accounts, bank list, catalog metadata.
- `useTransactions.ts`: Transaction list & mutation invalidations (`['transactions']`).
- `useCategories.ts`: Categories tree & subcategories invalidations.
- `useLoans.ts`: Loan mutations only (create, delete, pay installment); each invalidates `['bff','loans']` + `['bff','banks']`. Loan reads live in `useLoansPage.ts` / `useLoanSchedule.ts`.
- `useInvestments.ts`: Holdings, portfolio summary, price history.
- `useDashboard.ts`: Gateway BFF aggregated dashboard view.
- `useNotifications.ts`: Notification list & unread count.
- `useNotificationSSE.ts`: SSE EventSource listener (auto-reconnects, invalidates `['notifications']`).
- `useSearch.ts`: Global search query hook (`['bff', 'search', debounced]`), debounced 250ms, enabled on q.length >= 2, staleTime 30s.
- `useCards.ts`: Cards & card installment management.
- `useImport.ts`: Upload preview & confirmation wizard state.

## Zustand UI Store (`lib/store/ui.store.ts`)

Manages transient client UI state:

- **Modals:** `modal` name, `modalData`, `openModal()`, `closeModal()`.
- **Mobile Sidebar:** `sidebarOpen`, `setSidebarOpen()`, `toggleSidebar()`.

Modal names: `create-transaction`, `edit-transaction`, `create-category`, `create-subcategory`, `create-loan`, `create-card-expense`.

Confirmation dialogs are local component state over the ui-kit `Dialog` (see
`components/pages/loans/LoansContent.tsx`) — there is no shared confirm-delete store slice.

`useTransactionsPage` uses `placeholderData: keepPreviousData` so filter options survive a filter change; during a refetch sections show the previous data, not the skeleton.

## Holding draft store (`lib/store/holdingDraft.store.ts`)

`useHoldingDraftStore` carries the one investments dialog's input across tabs and routes:
`draft` is `{ mode: 'create', prefill }` or `{ mode: 'edit', holdingId }`; `openCreate(prefill?)`,
`openEdit(id)`, `clear()`. Cartera renders the only `RecordHoldingDialog` and opens it whenever a
draft is set; Mercados and the position page set a draft and switch to `?tab=cartera`. Edit mode
reads the holding's native values from the cached `useHoldings()` list, never from a BFF row.
`HoldingDraftReset` (rendered by the dashboard layout) clears the draft when the pathname leaves
`/investments` and `/investments/*`.

## Cartera view store (`lib/store/carteraView.store.ts`)

`useCarteraViewStore` keeps how the user likes to see Cartera, per browser: `grouped` (group by asset
type, default on), `columns` (visibility of Nombre, Tipo, Banco, Cantidad, Costo prom., Precio,
Valor total, % cartera, P&L $, P&L %) and `sort`. Zustand `persist`, key
`investments.cartera.view.v1`, `version: 1`, storage `safeJsonStorage` (`lib/store/safeStorage.ts`: every
`localStorage` call in `try/catch`); `merge` keeps only well-typed fields, so a missing, blocked or corrupt
value means the defaults. `skipHydration: true`: `PortfolioTab` calls `persist.rehydrate()` on mount, so
server and first client render agree. The text filter and the type chips are component state and are never
stored. On a phone (`useMediaQuery('(max-width: 767px)')`) the table shows only Ticker and the actions
(`PHONE_COLUMNS`), whatever is stored, and the column picker is hidden.

## UI store sidebar (`lib/store/ui.store.ts`)

`sidebarCollapsed` (desktop rail: `clamp(176px, 11vw, 240px)` expanded, 64px collapsed) persists under
`ui.sidebar.collapsed.v1` (`partialize` to that field only, `skipHydration`, `SideNav` rehydrates on
mount). The mobile drawer's `sidebarOpen` lives in the same store and is never persisted.

## ui-kit controls

`FilterSearchField` (controlled search input, no state) and `MultiSelectFilter` (checkbox dropdown; listed values in option order, unlisted selected values kept; trigger named `label: summary`) in `components/ui-kit/controls/`.
