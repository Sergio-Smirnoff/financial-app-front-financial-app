import { api } from '@/lib/api/client'
import { API_CONFIG } from '@/lib/api/config'
import type { CategoriesBff, BffQuery } from './types'

export function getCategories({ currency = 'ARS', secondary = 'none' }: BffQuery = {}) {
  return api.get<CategoriesBff>(`${API_CONFIG.ENDPOINTS.BFF}/categories?currency=${currency}&secondary=${secondary}`)
}
