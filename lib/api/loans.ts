import { api } from './client'
import type { Loan, LoanInstallment, LoanRequest } from '@/types/loans'

export const loansApi = {
  list: (bankNumber?: string) =>
    api.get<Loan[]>('/api/v1/banks/loans' + (bankNumber ? `?bankNumber=${bankNumber}` : '')),

  create: (data: LoanRequest) =>
    api.post<Loan>('/api/v1/banks/loans', data),

  delete: (id: number) =>
    api.delete<void>(`/api/v1/banks/loans/${id}`),

  listInstallments: (loanId: number) =>
    api.get<LoanInstallment[]>(`/api/v1/banks/loans/${loanId}/installments`),

  payInstallment: (loanId: number, installmentId: number, accountCbu: string, paidDate?: string) =>
    api.post<LoanInstallment>(
      `/api/v1/banks/loans/${loanId}/installments/${installmentId}/pay?accountCbu=${accountCbu}` + (paidDate ? `&paidDate=${paidDate}` : ''),
      {}
    ),
}
