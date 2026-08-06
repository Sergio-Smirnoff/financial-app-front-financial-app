# Frontend — UI and Server State Management

State management decision rules: Server state vs Local UI state.

## State Decision Rule

| State Type | Library | Location | Pattern |
|---|---|---|---|
| **Server State** | TanStack Query v5 | `lib/hooks/use*.ts` | `useQuery` for reads; `useMutation` + `queryClient.invalidateQueries` on write success |
| **URL State** | nuqs | Component / Page | `useQueryState` / `useQueryStates` wrapped in `<NuqsAdapter>` |
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
- `useLoans.ts`: Loans list & installment payment.
- `useInvestments.ts`: Holdings, portfolio summary, price history.
- `useDashboard.ts`: Gateway BFF aggregated dashboard view.
- `useNotifications.ts`: Notification list & unread count.
- `useNotificationSSE.ts`: SSE EventSource listener (auto-reconnects, invalidates `['notifications']`).
- `useCards.ts`: Cards & card installment management.
- `useImport.ts`: Upload preview & confirmation wizard state.

## Zustand UI Store (`lib/store/ui.store.ts`)

Manages transient client UI state:

- **Modals:** `modal` name, `modalData`, `openModal()`, `closeModal()`.
- **Confirm Dialog:** `confirmDelete` state, target entity info, `openConfirmDelete()`, `closeConfirmDelete()`.
- **Mobile Sidebar:** `sidebarOpen`, `setSidebarOpen()`, `toggleSidebar()`.

Modal names: `create-transaction`, `edit-transaction`, `create-category`, `create-subcategory`, `create-loan`, `create-card-expense`, `confirm-delete`.
