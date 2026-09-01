import { useMutation, useQueryClient } from '@tanstack/react-query'
import { loansApi } from '@/lib/api/loans'
import type { LoanRequest } from '@/types/loans'

const BFF_LOANS = ['bff', 'loans'] as const
const BFF_BANKS = ['bff', 'banks'] as const
const BFF_TRANSACTIONS = ['bff', 'transactions'] as const

export function useCreateLoan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: LoanRequest) => loansApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BFF_LOANS })
      qc.invalidateQueries({ queryKey: BFF_BANKS })
    },
  })
}

export function useDeleteLoan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => loansApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BFF_LOANS })
      qc.invalidateQueries({ queryKey: BFF_BANKS })
    },
  })
}

export function usePayLoanInstallment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { loanId: number; installmentId: number; accountCbu: string; paidDate?: string }) =>
      loansApi.payInstallment(vars.loanId, vars.installmentId, vars.accountCbu, vars.paidDate),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: BFF_LOANS })
      qc.invalidateQueries({ queryKey: BFF_BANKS })
      qc.invalidateQueries({ queryKey: BFF_TRANSACTIONS })
      qc.invalidateQueries({ queryKey: ['transactions', 'account', vars.accountCbu] })
    },
  })
}
