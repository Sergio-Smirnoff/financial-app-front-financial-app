import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getTransactionDetail } from '@/lib/api/bff/transactions'

export function useTransactionDetail(id: number | string | null) {
  return useQuery({
    queryKey: ['bff', 'transactions', 'detail', id],
    queryFn: () => getTransactionDetail(id!),
    enabled: id !== null && id !== undefined,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
}
