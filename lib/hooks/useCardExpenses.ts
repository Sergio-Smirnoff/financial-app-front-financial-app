import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cardExpensesApi } from '@/lib/api/card-expenses'
import type { CreateCardExpenseRequest } from '@/types/finances'

export function useCardExpenses(filters: { active?: boolean; cardId?: number; currency?: string } = {}) {
  return useQuery({
    queryKey: ['card-expenses', filters],
    queryFn: () => cardExpensesApi.getAll(filters),
  })
}

export function useCreateCardExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCardExpenseRequest) => cardExpensesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-expenses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteCardExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cardExpensesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-expenses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function usePayCardInstallment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cardExpensesApi.payInstallment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-expenses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
