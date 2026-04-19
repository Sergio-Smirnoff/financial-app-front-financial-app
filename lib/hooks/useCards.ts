import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cardsApi } from '@/lib/api/cards'
import type { CardExpenseCreateRequest, CardRequest } from '@/types/cards'

const QK = {
  all: ['cards'] as const,
  byAccount: (accountId: number) => ['cards', { accountId }] as const,
  one: (id: number) => ['cards', id] as const,
  installments: (cardId: number) => ['cards', cardId, 'installments'] as const,
}

export function useCards(accountId?: number) {
  return useQuery({
    queryKey: accountId ? QK.byAccount(accountId) : QK.all,
    queryFn: () => cardsApi.list(accountId),
  })
}

export function useCreateCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CardRequest) => cardsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.all }),
  })
}

export function useDeleteCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cardsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.all }),
  })
}

export function useCardInstallments(cardId: number | null) {
  return useQuery({
    queryKey: cardId ? QK.installments(cardId) : ['cards', 'installments', 'disabled'],
    queryFn: () => cardsApi.listInstallments(cardId!),
    enabled: cardId != null,
  })
}

export function useCreateCardExpense(cardId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CardExpenseCreateRequest) => cardsApi.createExpense(cardId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.installments(cardId) }),
  })
}

export function useMarkInstallmentPaid(cardId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { installmentId: number; paidDate?: string }) =>
      cardsApi.markPaid(cardId, vars.installmentId, vars.paidDate),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.installments(cardId) }),
  })
}
