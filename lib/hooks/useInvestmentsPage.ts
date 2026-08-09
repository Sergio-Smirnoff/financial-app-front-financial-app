import { useQuery } from '@tanstack/react-query'
import { getInvestments } from '@/lib/api/bff/investments'
import type { BffQuery } from '@/lib/api/bff/types'

export function useInvestmentsPage(query: BffQuery = {}) {
  const currency = query.currency ?? 'ARS'
  const secondary = query.secondary ?? 'none'

  return useQuery({
    queryKey: ['bff', 'investments', currency, secondary],
    queryFn: () => getInvestments({ currency, secondary }),
    staleTime: 30_000,
  })
}
