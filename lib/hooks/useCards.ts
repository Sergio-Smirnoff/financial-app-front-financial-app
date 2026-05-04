import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cardsApi } from '@/lib/api/cards'
import type { CardRequest, CardExpenseCreateRequest, CardInstallment, Card } from '@/types/cards'
import { toast } from 'sonner'

export function useCards(bankId?: number) {
  return useQuery<Card[]>({
    queryKey: ['cards', bankId],
    queryFn: () => cardsApi.list(bankId),
  })
}

export function useCard(id: number) {
  return useQuery<Card>({
    queryKey: ['card', id],
    queryFn: () => cardsApi.get(id),
  })
}

export function useCreateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CardRequest) => cardsApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      toast.success('Card created')
    },
  })
}

export function useUpdateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: CardRequest }) => cardsApi.update(id, body),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['card', id] })
      toast.success('Card updated')
    },
  })
}

export function useDeleteCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cardsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      toast.success('Card deleted')
    },
  })
}

export function useCardInstallments(cardId: number | null) {
  return useQuery<CardInstallment[]>({
    queryKey: ['card-installments', cardId],
    queryFn: async () => {
      if (cardId === null) return []
      return cardsApi.listInstallments(cardId)
    },
    enabled: cardId !== null,
  })
}

export function useCreateCardExpense(cardId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CardExpenseCreateRequest) =>
      cardsApi.createExpense(cardId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-installments', cardId] })
      toast.success('Expense created')
    },
  })
}

export function useMarkInstallmentPaid(cardId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      installmentId,
      accountId,
      paidDate,
    }: {
      installmentId: number
      accountId: number
      paidDate?: string
    }) => cardsApi.markPaid(cardId, installmentId, accountId, paidDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-installments', cardId] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast.success('Installment marked as paid')
    },
  })
}
