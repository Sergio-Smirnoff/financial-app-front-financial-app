import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsApi } from '@/lib/api/transactions'
import type { TransactionFilters, SummaryFilters, RecordTransactionRequest } from '@/types/finances'

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsApi.getAll(filters),
  })
}

export function useAccountTransactions(cbu: string) {
  return useQuery({
    queryKey: ['transactions', 'account', cbu],
    queryFn: () => transactionsApi.getByAccount(cbu),
    enabled: !!cbu,
  })
}

export function useTransaction(id: number) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => transactionsApi.getById(id),
    enabled: !!id,
  })
}

export function useTransactionSummary(filters: SummaryFilters = {}) {
  return useQuery({
    queryKey: ['transactions', 'summary', filters],
    queryFn: () => transactionsApi.getSummary(filters),
  })
}

// Account balances live in ms-banks and are updated asynchronously via Kafka after
// a finances transaction commits. A single refetch can fire before the event has
// propagated, leaving a stale balance until a manual refresh. Stagger several
// refetches so a later one catches the propagated update.
function syncBalancesEventually(queryClient: ReturnType<typeof useQueryClient>) {
  for (const ms of [300, 1200, 2500, 4500]) {
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['banks'] })
      queryClient.invalidateQueries({ queryKey: ['bff', 'banks'] })
    }, ms)
  }
}

export function useRecordTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RecordTransactionRequest) => transactionsApi.record(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['bff'] })
      syncBalancesEventually(queryClient)
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => transactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['bff'] })
      syncBalancesEventually(queryClient)
    },
  })
}
