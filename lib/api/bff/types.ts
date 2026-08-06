import type { MoneyView } from '@/lib/format'

export type SectionStatus = 'OK' | 'UNAVAILABLE'

export interface Section<T> {
  status: SectionStatus
  observedAt: string
  data: T
}

export interface TransactionRow {
  id: number
  date: string
  description: string
  accountCbu: string
  accountAlias: string
  categoryId: number | null
  categoryName: string | null
  method: string | null
  note: string | null
  amount: MoneyView
  direction: 'IN' | 'OUT'
}

export interface OverviewBff {
  kpis: Section<{ cash: MoneyView; income: MoneyView; expense: MoneyView; committed: MoneyView }>
  netWorth: Section<{ series: { date: string; value: MoneyView }[]; delta: { amount: MoneyView; pct: number }; allTimeHigh: boolean }>
  breakdown: Section<{ investments: MoneyView; cash: MoneyView; debt: MoneyView; savings: MoneyView }>
  flow: Section<{ month: string; income: MoneyView; expense: MoneyView }[]>
  committed: Section<{ month: string; amount: MoneyView }[]>
  upcomingPayments: Section<{ id: string; label: string; dueDate: string; amount: MoneyView; kind: string }[]>
  spendByCategory: Section<{ categoryId: number; name: string; amount: MoneyView; pct: number }[]>
  latestMovements: Section<TransactionRow[]>
}

export interface BankAccountRow {
  id: number
  bankName: string
  accountType: string
  cbu: string
  alias: string
  balance: MoneyView
  lastSync: string
}

export interface CreditCardRow {
  id: number
  cardName: string
  lastFour: string
  dueDate: string
  closingDate: string
  balance: MoneyView
}

export interface LoanRow {
  id: number
  title: string
  lender: string
  totalAmount: MoneyView
  remainingAmount: MoneyView
  installmentAmount: MoneyView
  installmentsLeft: number
  nextDueDate: string
}

export interface BanksBff {
  summary: Section<{ totalBalance: MoneyView; activeAccounts: number; activeCards: number; totalLoans: MoneyView }>
  accounts: Section<BankAccountRow[]>
  cards: Section<CreditCardRow[]>
  loans: Section<LoanRow[]>
}

export interface TransactionsBff {
  filters: Section<{ categories: { id: number; name: string }[]; accounts: { cbu: string; alias: string }[] }>
  movements: Section<{ items: TransactionRow[]; page: number; totalPages: number; totalCount: number }>
}

export interface CategoriesBff {
  categories: Section<{ id: number; name: string; icon: string; color: string; spendThisMonth: MoneyView; budgetMonthly: MoneyView | null }[]>
}

export interface InvestmentHoldingRow {
  id: number
  ticker: string
  assetType: string
  quantity: number
  avgPrice: MoneyView
  currentPrice: MoneyView
  totalValue: MoneyView
  pnl: { amount: MoneyView; pct: number }
}

export interface InvestmentsBff {
  summary: Section<{ totalInvested: MoneyView; totalPnl: { amount: MoneyView; pct: number } }>
  holdings: Section<InvestmentHoldingRow[]>
  allocation: Section<{ assetType: string; amount: MoneyView; pct: number }[]>
}

export interface ImportsBff {
  history: Section<{ id: string; fileName: string; source: string; status: string; importedAt: string; rowCount: number }[]>
}

export interface SettingsBff {
  profile: Section<{ email: string; name: string; preferredCurrency: string }>
  security: Section<{ mfaEnabled: boolean; lastPasswordChange: string }>
}

export interface SearchBff {
  results: Section<{ id: string; type: 'transaction' | 'bank' | 'holding'; title: string; subtitle: string; link: string }[]>
}

export interface BffQuery {
  currency?: string
  secondary?: string
}
