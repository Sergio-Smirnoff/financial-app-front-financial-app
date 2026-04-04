import { api } from './client'
import type { CardExpense, CreateCardExpenseRequest } from '@/types/finances'

const BASE = '/api/v1/finances/card-expenses'

export const cardExpensesApi = {
  getAll: (filters: { active?: boolean; cardId?: number; currency?: string } = {}) => {
    const params = new URLSearchParams()
    if (filters.active !== undefined) params.set('active', String(filters.active))
    if (filters.cardId !== undefined) params.set('cardId', String(filters.cardId))
    if (filters.currency) params.set('currency', filters.currency)
    const qs = params.toString()
    return api.get<CardExpense[]>(`${BASE}${qs ? `?${qs}` : ''}`)
  },

  create: (data: CreateCardExpenseRequest) =>
    api.post<CardExpense>(BASE, data),

  delete: (id: number) =>
    api.delete<void>(`${BASE}/${id}`),

  payInstallment: (id: number) =>
    api.post<CardExpense>(`${BASE}/${id}/pay-installment`, {}),
}
