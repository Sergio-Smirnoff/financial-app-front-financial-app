import type { components } from './schema'

type Schemas = components['schemas']

export type Section<T> = { status: 'OK' | 'UNAVAILABLE'; observedAt: string; data: T | null }
export type MoneyView = Omit<Schemas['MoneyView'], 'secondary'> & { secondary?: Schemas['MoneyView'] | null }

export type OverviewBff = Schemas['OverviewBffResponse']
export type BanksBff = Schemas['BanksBffResponse']
export type TransactionsBff = Schemas['TransactionsBffResponse']
export type TransactionDetailBff = Schemas['TransactionDetailBffResponse']
export type CategoriesBff = Schemas['CategoriesBffResponse']
export type InvestmentsBff = Schemas['InvestmentsBffResponse']
export type ImportsBff = Schemas['ImportsBffResponse']
export type SettingsBff = Schemas['SettingsBffResponse']
export type SearchBff = Schemas['SearchBffResponse']

export type LoanRow = Schemas['LoanRowResponse']
export type AccountRow = Schemas['AccountRowResponse']
export type CardRow = Schemas['CardRowResponse']
export type TransactionRow = Schemas['TransactionRowResponse']
export type PositionRow = Schemas['PositionRowResponse']

export interface BffQuery {
  currency?: 'ARS' | 'USD_MEP' | 'USD_CCL'
  secondary?: 'none' | 'ARS' | 'USD_MEP' | 'USD_CCL'
}
