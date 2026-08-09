import { api } from '@/lib/api/client'
import { API_CONFIG } from '@/lib/api/config'
import type { TransactionsBff } from './types'

export interface TransactionsQuery {
  currency?: string
  secondary?: string
  q?: string
  categoryId?: number
  accountCbu?: string
  page?: number
}

export function getTransactions({
  currency = 'ARS',
  secondary = 'none',
  q = '',
  categoryId,
  accountCbu,
  page = 1,
}: TransactionsQuery = {}) {
  const params = new URLSearchParams({ currency, secondary, page: String(page) })
  if (q) params.set('q', q)
  if (categoryId !== undefined) params.set('categoryId', String(categoryId))
  if (accountCbu) params.set('accountCbu', accountCbu)
  return api.get<TransactionsBff>(`${API_CONFIG.ENDPOINTS.BFF}/transactions?${params.toString()}`)
}

export function getTransactionDetail(id: number | string) {
  return api.get<any>(`${API_CONFIG.ENDPOINTS.BFF}/transactions/${id}`)
}
