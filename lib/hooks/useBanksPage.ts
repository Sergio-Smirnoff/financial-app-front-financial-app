import { useQuery } from '@tanstack/react-query'
import { getBanks } from '@/lib/api/bff/banks'
import type { BffQuery } from '@/lib/api/bff/types'

export function useBanksPage(query: BffQuery = {}) {
  const currency = query.currency ?? 'ARS'
  const secondary = query.secondary ?? 'none'

  return useQuery({
    queryKey: ['bff', 'banks', currency, secondary],
    queryFn: () => getBanks({ currency, secondary }),
    staleTime: 30_000,
  })
}
