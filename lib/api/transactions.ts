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
  getAll: (filters: TransactionFilters = {}) =>
    api.get<Transaction[]>(`${BASE}${buildParams(filters as Record<string, unknown>)}`),

  getById: (id: number) =>
    api.get<Transaction>(`${BASE}/${id}`),

  getByAccount: (cbu: string) =>
    api.get<AccountTransactionRow[]>(`${BASE}${buildParams({ accountCbu: cbu })}`),

  record: (data: RecordTransactionRequest) =>
    api.post<Transaction>(BASE, data),

  delete: (id: number) =>
    api.delete<void>(`${BASE}/${id}`),

  getSummary: (filters: SummaryFilters = {}) =>
    api.get<SummaryItem[]>(`${BASE}/summary${buildParams(filters as Record<string, unknown>)}`),
}
