import { api } from '@/lib/api/client'
import { API_CONFIG } from '@/lib/api/config'
import type { OverviewBff, BffQuery } from './types'

export function getOverview({ currency = 'ARS', secondary = 'none' }: BffQuery = {}) {
  return api.get<OverviewBff>(`${API_CONFIG.ENDPOINTS.BFF}/overview?currency=${currency}&secondary=${secondary}`)
}
