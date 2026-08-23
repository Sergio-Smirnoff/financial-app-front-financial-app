import type { components } from './schema'

type Schemas = components['schemas']
type RawMoney = Schemas['MoneyView']
type RawSection = { data?: unknown; observedAt: string; status: string }

export type MoneyView = Omit<RawMoney, 'secondary'> & { secondary?: MoneyView | null }
export type Section<T> = { status: 'OK' | 'UNAVAILABLE'; observedAt: string; data?: T | null }

type Normalised<T> =
  T extends RawMoney ? MoneyView
  : T extends RawSection ? Section<Normalised<NonNullable<T extends { data?: infer D } ? D : never>>>
  : T extends readonly (infer U)[] ? Normalised<U>[]
  : T extends object ? { [K in keyof T]: Normalised<T[K]> }
  : T

export type OverviewBff = Normalised<Schemas['OverviewBffResponse']>
export type BanksBff = Normalised<Schemas['BanksBffResponse']>
export type TransactionsBff = Normalised<Schemas['TransactionsBffResponse']>
export type TransactionDetailBff = Normalised<Schemas['TransactionDetailBffResponse']>
export type CategoriesBff = Normalised<Schemas['CategoriesBffResponse']>
export type InvestmentsBff = Normalised<Schemas['InvestmentsBffResponse']>
export type ImportsBff = Normalised<Schemas['ImportsBffResponse']>
export type SettingsBff = Normalised<Schemas['SettingsBffResponse']>
export type SearchBff = Normalised<Schemas['SearchBffResponse']>

export type LoanRow = Normalised<Schemas['LoanRowResponse']>
export type AccountRow = Normalised<Schemas['AccountRowResponse']>
export type CardRow = Normalised<Schemas['CardRowResponse']>
export type TransactionRow = Normalised<Schemas['TransactionRowResponse']>
export type PositionRow = Normalised<Schemas['PositionRowResponse']>
export type SearchHit = Normalised<Schemas['SearchHitResponse']>

export interface BffQuery {
  currency?: 'ARS' | 'USD_MEP' | 'USD_CCL'
  secondary?: 'none' | 'ARS' | 'USD_MEP' | 'USD_CCL'
}
