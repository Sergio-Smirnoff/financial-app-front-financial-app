import { useQuery } from '@tanstack/react-query'
import { getTransactions, type TransactionsQuery } from '@/lib/api/bff/transactions'

export function useTransactionsPage(query: TransactionsQuery = {}) {
  const currency = query.currency ?? 'ARS'
  const secondary = query.secondary ?? 'none'
  const q = query.q ?? ''
  const categoryId = query.categoryId
  const accountCbu = query.accountCbu ?? ''
  const page = query.page ?? 1

  return useQuery({
    queryKey: ['bff', 'transactions', currency, secondary, q, categoryId, accountCbu, page],
    queryFn: () => getTransactions({ currency, secondary, q, categoryId, accountCbu, page }),
    staleTime: 30_000,
  })
}
