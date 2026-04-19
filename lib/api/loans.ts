import { api } from './client'
import type { Loan, LoanInstallment, LoanRequest } from '@/types/loans'

export const loansApi = {
  list: (accountId?: number) =>
    api.get<Loan[]>('/api/v1/banks/loans' + (accountId ? `?accountId=${accountId}` : '')),
  
  create: (data: LoanRequest) =>
    api.post<Loan>('/api/v1/banks/loans', data),
  
  delete: (id: number) =>
    api.delete<void>(`/api/v1/banks/loans/${id}`),

  listInstallments: (loanId: number) =>
    api.get<LoanInstallment[]>(`/api/v1/banks/loans/${loanId}/installments`),

  payInstallment: (loanId: number, installmentId: number, paidDate?: string) =>
    api.post<LoanInstallment>(
      `/api/v1/banks/loans/${loanId}/installments/${installmentId}/pay` + (paidDate ? `?paidDate=${paidDate}` : ''),
      {}
    ),
}
