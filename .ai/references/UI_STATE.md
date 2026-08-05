# Frontend — UI and Server State Management

State management decision rules: Server state vs Local UI state.

## State Decision Rule

| State Type | Library | Location | Pattern |
|---|---|---|---|
| **Server State** | TanStack Query v5 | `lib/hooks/use*.ts` | `useQuery` for reads; `useMutation` + `queryClient.invalidateQueries` on write success |
| **Global UI State** | Zustand | `lib/store/ui.store.ts` | Modal visibility, confirm dialogs, mobile sidebar open/close |
| **Form State** | React Hook Form | Page / Component | `react-hook-form` + `zod` resolvers (`lib/schemas/`) |
| **Theme / SSE** | React Context | `providers/` | `ThemeProvider` (next-themes), `NotificationProvider` (mounts SSE) |

## TanStack Query Hooks (`lib/hooks/`)

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
