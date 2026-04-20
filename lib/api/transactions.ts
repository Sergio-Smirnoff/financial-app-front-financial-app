import { api } from './client'
import type { PageResponse } from '@/types/api'
import type {
  Transaction,
  TransactionFilters,
  SummaryFilters,
  SummaryItem,
  CreateTransactionRequest,
  TransferRequest,
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
    api.get<PageResponse<Transaction>>(`${BASE}${buildParams(filters as Record<string, unknown>)}`),

  getById: (id: number) =>
    api.get<Transaction>(`${BASE}/${id}`),

  getByAccount: (accountId: number) =>
    api.get<Transaction[]>(`${BASE}/account/${accountId}`),

  create: (data: CreateTransactionRequest) =>
    api.post<Transaction>(BASE, data),

  update: (id: number, data: CreateTransactionRequest) =>
    api.put<Transaction>(`${BASE}/${id}`, data),

  delete: (id: number) =>
    api.delete<void>(`${BASE}/${id}`),

  transfer: (data: TransferRequest) =>
    api.post<void>(`${BASE}/transfer`, data),

  getSummary: (filters: SummaryFilters = {}) =>
    api.get<SummaryItem[]>(`${BASE}/summary${buildParams(filters as Record<string, unknown>)}`),
}
