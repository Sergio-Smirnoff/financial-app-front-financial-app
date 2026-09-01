import { useQuery } from '@tanstack/react-query'
import { getLoans } from '@/lib/api/bff/loans'
import type { BffQuery, LoansBff } from '@/lib/api/bff/types'

export function useLoansPage(query: BffQuery = {}) {
  const currency = query.currency ?? 'ARS'
  const secondary = query.secondary ?? 'none'

  return useQuery<LoansBff>({
    queryKey: ['bff', 'loans', currency, secondary],
    queryFn: () => getLoans({ currency, secondary }),
    staleTime: 30_000,
  })
}
