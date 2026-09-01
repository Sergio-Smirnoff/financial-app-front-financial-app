import { api } from '@/lib/api/client'
import { API_CONFIG } from '@/lib/api/config'
import type { BanksBff, BffQuery } from './types'

export function getBanks({ currency = 'ARS', secondary = 'none' }: BffQuery = {}) {
  return api.get<BanksBff>(`${API_CONFIG.ENDPOINTS.BFF}/banks?currency=${currency}&secondary=${secondary}`)
}
