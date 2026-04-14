export interface SpringPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export type TransactionType = 'INCOME' | 'EXPENSE'
export type CategoryType = 'INCOME' | 'EXPENSE' | 'BOTH'

export interface Transaction {
  id: number
  userId: number
  type: TransactionType
  amount: number
  currency: string
  categoryId: number
  categoryName: string | null
  description: string | null
  date: string
  createdAt: string
  updatedAt: string
}

export interface TransactionFilters {
  type?: TransactionType
  categoryId?: number
  currency?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  size?: number
}

export interface SummaryFilters {
  currency?: string
  dateFrom?: string
  dateTo?: string
}

export interface Category {
  id: number
  name: string
  type: CategoryType
  color: string | null
  icon: string | null
  isSystem: boolean
  subcategories?: Subcategory[]
}

export interface Subcategory {
  id: number
  name: string
  type: CategoryType
  isSystem: boolean
  userId: number | null
}

export interface Loan {
  id: number
  userId: number
  description: string
  entity: string | null
  totalAmount: number
  currency: string
  totalInstallments: number
  paidInstallments: number
  nextPaymentDate: string | null
  installmentAmount: number
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

export interface CardExpense {
  id: number
  userId: number
  cardId: number
  description: string
  totalAmount: number
  currency: string
  totalInstallments: number
  remainingInstallments: number
  installmentAmount: number
  nextDueDate: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface UpcomingPayment {
  sourceId: number
  type: 'LOAN' | 'CARD_EXPENSE'
  description: string
  amount: number
  currency: string
  dueDate: string
  installmentNumber: number
  totalInstallments: number
  paid: boolean
}

export interface SummaryItem {
  currency: string
  totalIncome: number
  totalExpense: number
  balance: number
  activeLoans: number
  totalLoanDebt: number
  activeCardExpenses: number
  totalCardExpenseDebt: number
}

export interface DashboardSummary {
  financeSummary: ApiDashboardFinanceSummary | unknown
  cards: unknown
  recentNotifications: unknown
}

interface ApiDashboardFinanceSummary {
  success: boolean
  data: SummaryItem[]
}

// ─── Request types ────────────────────────────────────────────────────────────

export interface CreateTransactionRequest {
  type: TransactionType
  amount: number
  currency: string
  categoryId: number
  description?: string
  date: string
}

export interface CreateCategoryRequest {
  name: string
  type: CategoryType
  color?: string
  icon?: string
}

export interface CreateSubcategoryRequest {
  name: string
  type: CategoryType
}

export interface CreateLoanRequest {
  description: string
  entity?: string
  totalAmount: number
  currency: string
  totalInstallments: number
  installmentAmount: number
  firstPaymentDate: string
}

export interface CreateCardExpenseRequest {
  cardId: number
  description: string
  totalAmount: number
  currency: string
  totalInstallments: number
  installmentAmount: number
  nextDueDate: string
}
