export interface Loan {
  id: number
  bankId: number
  userId: number
  name: string
  principal: number
  currency: string
  interestRate: number
  totalInstallments: number
  remainingInstallments: number
  startDate: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface LoanInstallment {
  id: number
  loanId: number
  installmentNumber: number
  amount: number
  dueDate: string
  paid: boolean
  paidDate: string | null
  createdAt: string
  updatedAt: string
}

export interface LoanRequest {
  bankId: number
  name: string
  principal: number
  interestRate: number
  totalInstallments: number
  startDate: string
}
