import { api } from './client'
import type { Loan, LoanInstallment, LoanRequest } from '@/types/loans'

export const loansApi = {
  create: (data: LoanRequest) =>
    api.post<Loan>('/api/v1/banks/loans', data),

  delete: (id: number) =>
    api.delete<void>(`/api/v1/banks/loans/${id}`),

  payInstallment: (loanId: number, installmentId: number, accountCbu: string, paidDate?: string) =>
    api.post<LoanInstallment>(
      `/api/v1/banks/loans/${loanId}/installments/${installmentId}/pay?accountCbu=${accountCbu}` + (paidDate ? `&paidDate=${paidDate}` : ''),
      {}
    ),
}
