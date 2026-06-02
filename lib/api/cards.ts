import { api } from '@/lib/api/client'
import type {
  Card,
  CardRequest,
  UpdateCardRequest,
  CardInstallment,
  CardExpenseCreateRequest,
} from '@/types/cards'

export const cardsApi = {
  list: (bankNumber?: string) =>
    api.get<Card[]>('/api/v1/banks/cards' + (bankNumber ? `?bankNumber=${bankNumber}` : '')),
  get: (cardNumber: string) => api.get<Card>(`/api/v1/banks/cards/${cardNumber}`),
  create: (body: CardRequest) => api.post<Card>('/api/v1/banks/cards', body),
  update: (cardNumber: string, body: UpdateCardRequest) => api.patch<Card>(`/api/v1/banks/cards/${cardNumber}`, body),
  delete: (cardNumber: string) => api.delete<void>(`/api/v1/banks/cards/${cardNumber}`),

  listInstallments: (cardNumber: string) =>
    api.get<CardInstallment[]>(`/api/v1/banks/cards/${cardNumber}/installments`),
  createExpense: (cardNumber: string, body: CardExpenseCreateRequest) =>
    api.post<CardInstallment[]>(`/api/v1/banks/cards/${cardNumber}/installments`, body),
  markPaid: (cardNumber: string, installmentId: number, accountCbu: string, paidDate?: string) =>
    api.post<CardInstallment>(
      `/api/v1/banks/cards/${cardNumber}/installments/${installmentId}/pay?accountCbu=${accountCbu}`
        + (paidDate ? `&paidDate=${paidDate}` : ''),
      {},
    ),
}
