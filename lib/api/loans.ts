import { api } from './client'
import type { Loan, LoanInstallment, LoanRequest } from '@/types/loans'

export const loansApi = {
  list: (bankId?: number) =>
    api.get<Loan[]>('/api/v1/banks/loans' + (bankId ? `?bankId=${bankId}` : '')),
  
  create: (data: LoanRequest) =>
    api.post<Loan>('/api/v1/banks/loans', data),
  
  delete: (id: number) =>
    api.delete<void>(`/api/v1/banks/loans/${id}`),

  listInstallments: (loanId: number) =>
    api.get<LoanInstallment[]>(`/api/v1/banks/loans/${loanId}/installments`),

  payInstallment: (loanId: number, installmentId: number, accountId: number, paidDate?: string) =>
    api.post<LoanInstallment>(
      `/api/v1/banks/loans/${loanId}/installments/${installmentId}/pay?accountId=${accountId}` + (paidDate ? `&paidDate=${paidDate}` : ''),
      {}
    ),
}
