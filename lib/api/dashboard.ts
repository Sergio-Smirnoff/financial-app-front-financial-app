import { api } from './client'
import type { UpcomingPayment } from '@/types/finances'

const BASE = '/api/v1/finances'

export const dashboardApi = {
  getUpcomingPayments: (filters: { currency?: string; from: string; to: string }) => {
    const params = new URLSearchParams()
    if (filters.currency) params.set('currency', filters.currency)
    params.set('from', filters.from)
    params.set('to', filters.to)
    return api.get<UpcomingPayment[]>(`${BASE}/upcoming-payments?${params.toString()}`)
  },
}
