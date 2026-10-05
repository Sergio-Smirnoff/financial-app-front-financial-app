import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getInvestments, type InvestmentsQuery } from '@/lib/api/bff/investments'

export function useInvestmentsPage(query: InvestmentsQuery = {}) {
  const currency = query.currency ?? 'ARS'
  const secondary = query.secondary ?? 'none'
  const range = query.range ?? '1M'

  return useQuery({
    queryKey: ['bff', 'investments', currency, secondary, range],
    queryFn: () => getInvestments({ currency, secondary, range }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}
