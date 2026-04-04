import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { loansApi } from '@/lib/api/loans'
import type { CreateLoanRequest } from '@/types/finances'

export function useLoans(filters: { active?: boolean; currency?: string } = {}) {
  return useQuery({
    queryKey: ['loans', filters],
    queryFn: () => loansApi.getAll(filters),
  })
}

export function useLoanInstallments(loanId: number) {
  return useQuery({
    queryKey: ['loans', loanId, 'installments'],
    queryFn: () => loansApi.getInstallments(loanId),
    enabled: !!loanId,
  })
}

export function useCreateLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLoanRequest) => loansApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => loansApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function usePayLoanInstallment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ loanId, installmentId }: { loanId: number; installmentId: number }) =>
      loansApi.payInstallment(loanId, installmentId),
    onSuccess: (_data, { loanId }) => {
      queryClient.invalidateQueries({ queryKey: ['loans', loanId, 'installments'] })
      queryClient.invalidateQueries({ queryKey: ['loans'] })
    },
  })
}
