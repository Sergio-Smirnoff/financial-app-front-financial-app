import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cardsApi } from '@/lib/api/cards'
import type { CardRequest, UpdateCardRequest, CardExpenseCreateRequest, CardInstallment, Card } from '@/types/cards'
import { toast } from 'sonner'

export function useCards(bankNumber?: string) {
  return useQuery<Card[]>({
    queryKey: ['cards', bankNumber],
    queryFn: () => cardsApi.list(bankNumber),
  })
}

export function useCard(cardNumber: string) {
  return useQuery<Card>({
    queryKey: ['card', cardNumber],
    queryFn: () => cardsApi.get(cardNumber),
    enabled: !!cardNumber,
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
    mutationFn: ({ cardNumber, body }: { cardNumber: string; body: UpdateCardRequest }) => cardsApi.update(cardNumber, body),
    onSuccess: (_, { cardNumber }) => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['card', cardNumber] })
      toast.success('Card updated')
    },
  })
}

export function useDeleteCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cardNumber: string) => cardsApi.delete(cardNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      toast.success('Card deleted')
    },
  })
}

export function useCardInstallments(cardNumber: string | null) {
  return useQuery<CardInstallment[]>({
    queryKey: ['card-installments', cardNumber],
    queryFn: async () => {
      if (cardNumber === null) return []
      return cardsApi.listInstallments(cardNumber)
    },
    enabled: cardNumber !== null,
  })
}

export function useCreateCardExpense(cardNumber: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CardExpenseCreateRequest) =>
      cardsApi.createExpense(cardNumber, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-installments', cardNumber] })
      toast.success('Expense created')
    },
  })
}

export function useMarkInstallmentPaid(cardNumber: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      installmentId,
      accountCbu,
      paidDate,
    }: {
      installmentId: number
      accountCbu: string
      paidDate?: string
    }) => cardsApi.markPaid(cardNumber, installmentId, accountCbu, paidDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-installments', cardNumber] })
      queryClient.invalidateQueries({ queryKey: ['banks'] })
      toast.success('Installment marked as paid')
    },
  })
}
