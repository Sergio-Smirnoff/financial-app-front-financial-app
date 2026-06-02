export type CardBrand = 'VISA' | 'MASTERCARD' | 'AMEX'
export type CardType = 'STANDARD' | 'SILVER' | 'GOLD' | 'BLACK' | 'PLATINUM'
export type CardBehavior = 'INSTANT_PAYMENT' | 'INSTALLMENTS'

export interface Card {
  bankNumber: string
  userId: number
  displayName: string
  brand: CardBrand
  cardType: CardType
  behavior: CardBehavior
  cardNumber: string
  expiringDate: string   // "MM/yy"
  closingDay: number
  dueDay: number
  createdAt: string
  updatedAt: string
}

export interface CardRequest {
  bankNumber: string
  brand: CardBrand
  cardType: CardType
  behavior: CardBehavior
  cardNumber: string
  expiringDate: string
  closingDay: number
  dueDay: number
}

export interface UpdateCardRequest {
  expiringDate?: string
  closingDay?: number
  dueDay?: number
}

export interface CardInstallment {
  id: number
  cardNumber: string
  description: string
  totalAmount: string
  currency: string
  installmentNumber: number
  totalInstallments: number
  amount: string
  dueDate: string
  paid: boolean
  paidDate: string | null
}

export interface CardExpenseCreateRequest {
  description: string
  totalAmount: string
  currency: string
  totalInstallments: number
  firstDueDate: string
}
