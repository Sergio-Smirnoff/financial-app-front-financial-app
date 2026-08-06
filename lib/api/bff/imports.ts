import { api } from '@/lib/api/client'
import { API_CONFIG } from '@/lib/api/config'
import type { ImportsBff } from './types'

export function getImports() {
  return api.get<ImportsBff>(`${API_CONFIG.ENDPOINTS.BFF}/imports`)
}
