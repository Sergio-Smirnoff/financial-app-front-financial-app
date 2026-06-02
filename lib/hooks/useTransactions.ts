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

export function useRecordTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RecordTransactionRequest) => transactionsApi.record(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      // Give Kafka a moment to sync balance across microservices
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['banks'] })
      }, 500)
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => transactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['banks'] })
      }, 500)
    },
  })
}
