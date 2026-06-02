export interface SpringPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER'
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
  fromCbu: string | null
  toCbu: string | null
}

export interface TransactionFilters {
  accountCbu?: string
  currency?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  size?: number
}

export interface SummaryFilters {
  currency?: string
  accountCbu?: string
  dateFrom?: string
  dateTo?: string
}

export interface AccountTransactionRow {
  transactionId: number
  accountCbu: string
  amount: string
  currency: string
  description: string | null
  category: string | null
  subcategory: string | null
  date: string
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

export interface RecordTransactionRequest {
  fromCbu: string
  toCbu: string
  amount: string
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
