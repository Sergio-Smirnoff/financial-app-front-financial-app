import { api } from '@/lib/api/client'
import { API_CONFIG } from '@/lib/api/config'
import type { SettingsBff } from './types'

export function getSettings() {
  return api.get<SettingsBff>(`${API_CONFIG.ENDPOINTS.BFF}/settings`)
}
