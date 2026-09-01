import { useQuery } from '@tanstack/react-query'
import { getOverview } from '@/lib/api/bff/overview'
import type { BffQuery } from '@/lib/api/bff/types'

export function useOverviewPage(query: BffQuery = {}) {
  const currency = query.currency ?? 'ARS'
  const secondary = query.secondary ?? 'none'

  return useQuery({
    queryKey: ['bff', 'overview', currency, secondary],
    queryFn: () => getOverview({ currency, secondary }),
    staleTime: 30_000,
  })
}
