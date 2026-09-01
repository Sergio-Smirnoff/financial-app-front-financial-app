import { api } from '@/lib/api/client'
import { API_CONFIG } from '@/lib/api/config'
import type { LoansBff, LoanScheduleBff, BffQuery } from './types'

export function getLoans({ currency = 'ARS', secondary = 'none' }: BffQuery = {}) {
  return api.get<LoansBff>(`${API_CONFIG.ENDPOINTS.BFF}/loans?currency=${currency}&secondary=${secondary}`)
}

export function getLoanSchedule(id: number, { currency = 'ARS', secondary = 'none' }: BffQuery = {}) {
  return api.get<LoanScheduleBff>(`${API_CONFIG.ENDPOINTS.BFF}/loans/${id}?currency=${currency}&secondary=${secondary}`)
}
