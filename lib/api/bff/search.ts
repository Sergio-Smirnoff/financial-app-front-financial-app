import { api } from '@/lib/api/client'
import { API_CONFIG } from '@/lib/api/config'
import type { SearchBff } from './types'

export function getSearch(q: string) {
  return api.get<SearchBff>(`${API_CONFIG.ENDPOINTS.BFF}/search?q=${encodeURIComponent(q)}`)
}
