import { api } from './client'
import type { Loan, LoanInstallment, CreateLoanRequest, SpringPage } from '@/types/finances'

const BASE = '/api/v1/finances/loans'

export const loansApi = {
  getAll: async (filters: { active?: boolean; currency?: string } = {}): Promise<Loan[]> => {
    const params = new URLSearchParams()
    if (filters.active !== undefined) params.set('active', String(filters.active))
    if (filters.currency) params.set('currency', filters.currency)
    const qs = params.toString()
    const page = await api.get<SpringPage<Loan>>(`${BASE}${qs ? `?${qs}` : ''}`)
    return page.content
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
