export type CardBrand = 'VISA' | 'MASTERCARD' | 'AMEX'
export type CardType = 'STANDARD' | 'SILVER' | 'GOLD' | 'BLACK' | 'PLATINUM'
export type CardBehavior = 'INSTANT_PAYMENT' | 'INSTALLMENTS'

export interface Card {
  id: number
  accountId: number
  userId: number
  displayName: string
  brand: CardBrand
  cardType: CardType
  behavior: CardBehavior
  last4Digits: string
  expiringDate: string
  closingDay: number
  dueDay: number
  createdAt: string
  updatedAt: string
}

export interface CardRequest {
  accountId: number
  brand: CardBrand
  cardType: CardType
  behavior: CardBehavior
  last4Digits: string
  expiringDate: string
  closingDay: number
  dueDay: number
}

export interface CardInstallment {
  id: number
  cardId: number
  description: string
  totalAmount: number
  currency: string
  installmentNumber: number
  totalInstallments: number
  amount: number
  dueDate: string
  paid: boolean
  paidDate: string | null
}

export interface CardExpenseCreateRequest {
  description: string
  totalAmount: number
  currency: string
  totalInstallments: number
  firstDueDate: string
}
