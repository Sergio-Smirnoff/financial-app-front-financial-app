import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsApi } from '@/lib/api/transactions'
import type { TransactionFilters, SummaryFilters, CreateTransactionRequest,
  TransferRequest
} from '@/types/finances'

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsApi.getAll(filters),
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

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTransactionRequest) => transactionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateTransactionRequest }) =>
      transactionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
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
    },
  })
}

export function useTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TransferRequest) => transactionsApi.transfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['banks'] })
    },
  })
}
