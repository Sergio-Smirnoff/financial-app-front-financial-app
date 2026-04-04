import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api/dashboard'

export function useUpcomingPayments(filters: { currency?: string; from: string; to: string }) {
  return useQuery({
    queryKey: ['upcoming-payments', filters],
    queryFn: () => dashboardApi.getUpcomingPayments(filters),
  })
}
