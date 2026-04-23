import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { loansApi } from '@/lib/api/loans'
import type { LoanRequest } from '@/types/loans'

const QK = {
  all: ['loans'] as const,
  byAccount: (accountId: number) => ['loans', { accountId }] as const,
  installments: (loanId: number) => ['loans', loanId, 'installments'] as const,
}

export function useLoans(bankId?: number) {
  return useQuery({
    queryKey: bankId ? QK.byAccount(bankId) : QK.all,
    queryFn: () => loansApi.list(bankId),
  })
}

export function useCreateLoan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: LoanRequest) => loansApi.create(data),
    onSuccess: () => {
        qc.invalidateQueries({ queryKey: QK.all });
        qc.invalidateQueries({ queryKey: ['banks'] });
    },
  })
}

export function useDeleteLoan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => loansApi.delete(id),
    onSuccess: () => {
        qc.invalidateQueries({ queryKey: QK.all });
        qc.invalidateQueries({ queryKey: ['banks'] });
    },
  })
}

export function useLoanInstallments(loanId: number) {
  return useQuery({
    queryKey: QK.installments(loanId),
    queryFn: () => loansApi.listInstallments(loanId),
    enabled: loanId > 0,
  })
}

export function usePayLoanInstallment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { loanId: number; installmentId: number; accountId: number; paidDate?: string }) =>
      loansApi.payInstallment(vars.loanId, vars.installmentId, vars.accountId, vars.paidDate),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QK.installments(vars.loanId) })
      qc.invalidateQueries({ queryKey: QK.all })
      qc.invalidateQueries({ queryKey: ['banks'] })
      qc.invalidateQueries({ queryKey: ['transactions', 'account', vars.accountId] })
    },
  })
}
