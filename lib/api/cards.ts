import { api } from '@/lib/api/client'
import type {
  Card,
  CardRequest,
  CardInstallment,
  CardExpenseCreateRequest,
} from '@/types/cards'

export const cardsApi = {
  list: (bankId?: number) =>
    api.get<Card[]>('/api/v1/banks/cards' + (bankId ? `?bankId=${bankId}` : '')),
  get: (id: number) => api.get<Card>(`/api/v1/banks/cards/${id}`),
  create: (body: CardRequest) => api.post<Card>('/api/v1/banks/cards', body),
  update: (id: number, body: CardRequest) => api.put<Card>(`/api/v1/banks/cards/${id}`, body),
  delete: (id: number) => api.delete<void>(`/api/v1/banks/cards/${id}`),

  listInstallments: (cardId: number) =>
    api.get<CardInstallment[]>(`/api/v1/banks/cards/${cardId}/installments`),
  createExpense: (cardId: number, body: CardExpenseCreateRequest) =>
    api.post<CardInstallment[]>(`/api/v1/banks/cards/${cardId}/installments`, body),
  markPaid: (cardId: number, installmentId: number, accountId: number, paidDate?: string) =>
    api.post<CardInstallment>(
      `/api/v1/banks/cards/${cardId}/installments/${installmentId}/pay?accountId=${accountId}`
        + (paidDate ? `&paidDate=${paidDate}` : ''),
      {},
    ),
}
