export interface Loan {
  id: number
  bankNumber: string
  userId: number
  name: string
  principal: string
  currency: string
  interestRate: string
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
  amount: string
  dueDate: string
  paid: boolean
  paidDate: string | null
  createdAt: string
  updatedAt: string
}

export interface LoanRequest {
  bankNumber: string
  destinationAccountCbu: string
  name: string
  principal: string
  interestRate: string
  totalInstallments: number
  startDate: string
}
