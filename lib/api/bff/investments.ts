import { api } from '@/lib/api/client'
import { API_CONFIG } from '@/lib/api/config'
import type { InvestmentsBff, BffQuery } from './types'

export function getInvestments({ currency = 'ARS', secondary = 'none' }: BffQuery = {}) {
  return api.get<InvestmentsBff>(`${API_CONFIG.ENDPOINTS.BFF}/investments?currency=${currency}&secondary=${secondary}`)
}
