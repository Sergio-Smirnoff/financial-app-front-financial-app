import { api } from '@/lib/api/client'
import { API_CONFIG } from '@/lib/api/config'
import type { TransactionsBff, TransactionDetailBff } from './types'

export interface TransactionsQuery {
  currency?: string
  secondary?: string
  q?: string
  categories?: string
  accounts?: string
  method?: string
  page?: number
}

export function getTransactions({
  currency = 'ARS',
  secondary = 'none',
  q = '',
  categories,
  accounts,
  method,
  page = 1,
}: TransactionsQuery = {}) {
  const params = new URLSearchParams({ currency, secondary, page: String(Math.max(page - 1, 0)) })
  if (q) params.set('q', q)
  if (categories) params.set('categories', categories)
  if (accounts) params.set('accounts', accounts)
  if (method) params.set('method', method)
  return api.get<TransactionsBff>(`${API_CONFIG.ENDPOINTS.BFF}/transactions?${params.toString()}`)
}

export function getTransactionDetail(id: number | string) {
  return api.get<TransactionDetailBff>(`${API_CONFIG.ENDPOINTS.BFF}/transactions/${id}`)
}
