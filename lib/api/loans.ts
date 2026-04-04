import { api } from './client'
import type { Loan, LoanInstallment, CreateLoanRequest } from '@/types/finances'

const BASE = '/api/v1/finances/loans'

export const loansApi = {
  getAll: (filters: { active?: boolean; currency?: string } = {}) => {
    const params = new URLSearchParams()
    if (filters.active !== undefined) params.set('active', String(filters.active))
    if (filters.currency) params.set('currency', filters.currency)
    const qs = params.toString()
    return api.get<Loan[]>(`${BASE}${qs ? `?${qs}` : ''}`)
  },

  create: (data: CreateLoanRequest) =>
    api.post<Loan>(BASE, data),

  delete: (id: number) =>
    api.delete<void>(`${BASE}/${id}`),

  getInstallments: (loanId: number) =>
    api.get<LoanInstallment[]>(`${BASE}/${loanId}/installments`),

  payInstallment: (loanId: number, installmentId: number) =>
    api.put<LoanInstallment>(`${BASE}/${loanId}/installments/${installmentId}/pay`, {}),
}
