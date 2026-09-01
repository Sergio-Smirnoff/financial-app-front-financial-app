import { useQuery } from '@tanstack/react-query'
import { getLoanSchedule } from '@/lib/api/bff/loans'
import type { BffQuery, LoanScheduleBff } from '@/lib/api/bff/types'

export function useLoanSchedule(id: number, query: BffQuery = {}) {
  const currency = query.currency ?? 'ARS'
  const secondary = query.secondary ?? 'none'

  return useQuery<LoanScheduleBff>({
    queryKey: ['bff', 'loans', id, currency, secondary],
    queryFn: () => getLoanSchedule(id, { currency, secondary }),
    enabled: id > 0,
    staleTime: 30_000,
  })
}
