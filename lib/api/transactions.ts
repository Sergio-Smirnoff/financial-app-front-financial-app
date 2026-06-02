import { api } from './client'
import type {
  Transaction,
  TransactionFilters,
  SummaryFilters,
  SummaryItem,
  RecordTransactionRequest,
  AccountTransactionRow,
} from '@/types/finances'

const BASE = '/api/v1/finances/transactions'

interface RawTransaction {
  id: number
  userId: number
  fromCbu: string | null
  toCbu: string | null
  amount: string
  currency: string
  kind: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  categoryId: number
  categoryName: string | null
  description: string | null
  date: string
}

function toTransaction(r: RawTransaction): Transaction {
  return {
    id: r.id,
    userId: r.userId,
    type: r.kind,
    amount: Number(r.amount ?? 0),
    currency: r.currency,
    categoryId: r.categoryId,
    categoryName: r.categoryName ?? null,
    description: r.description,
    date: r.date,
    createdAt: r.date,
    updatedAt: r.date,
    fromCbu: r.fromCbu,
    toCbu: r.toCbu,
  }
}

function buildParams(filters: Record<string, unknown>): string {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  })
  const str = params.toString()
  return str ? `?${str}` : ''
}

export const transactionsApi = {
  getAll: async (filters: TransactionFilters = {}): Promise<Transaction[]> => {
    // Backend TransactionResponse uses `kind` (not `type`), string amount, and no
    // categoryName (only categoryId). Adapt to the FE Transaction shape.
    const raw = await api.get<RawTransaction[]>(`${BASE}${buildParams(filters as Record<string, unknown>)}`)
    return (raw ?? []).map(toTransaction)
  },

  getById: async (id: number): Promise<Transaction> =>
    toTransaction(await api.get<RawTransaction>(`${BASE}/${id}`)),

  getByAccount: (cbu: string) =>
    api.get<AccountTransactionRow[]>(`${BASE}${buildParams({ accountCbu: cbu })}`),

  record: (data: RecordTransactionRequest) =>
    api.post<Transaction>(BASE, data),

  delete: (id: number) =>
    api.delete<void>(`${BASE}/${id}`),

  getSummary: async (filters: SummaryFilters = {}): Promise<SummaryItem[]> => {
    // Backend expects `from`/`to`; frontend filters use `dateFrom`/`dateTo`.
    const query = buildParams({
      from: filters.dateFrom,
      to: filters.dateTo,
      currency: filters.currency,
      accountCbu: filters.accountCbu,
    })
    // Backend returns a map keyed by currency code, not an array.
    const byCurrency = await api.get<Record<string, CurrencySummaryPayload>>(
      `${BASE}/summary${query}`,
    )
    // Guard against a non-object (e.g. backend regression to an array) — Object.entries
    // on an array would yield numeric-string "currency" keys.
    if (!byCurrency || Array.isArray(byCurrency)) return []
    return Object.entries(byCurrency).map(([currency, s]) => ({
      currency,
      totalIncome: Number(s.totalIncome ?? 0),
      totalExpense: Number(s.totalExpense ?? 0),
      balance: Number(s.balance ?? 0),
    }))
  },
}

interface CurrencySummaryPayload {
  totalIncome: string
  totalExpense: string
  balance: string
}
