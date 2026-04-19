import { api } from './client'
import type { UpcomingPayment } from '@/types/finances'

export const dashboardApi = {
  getUpcomingPayments: (filters: { from: string; to: string }) => {
    const params = new URLSearchParams()
    params.set('from', filters.from)
    params.set('to', filters.to)
    return api.get<UpcomingPayment[]>(`/api/v1/banks/upcoming-payments?${params.toString()}`)
  },
}
