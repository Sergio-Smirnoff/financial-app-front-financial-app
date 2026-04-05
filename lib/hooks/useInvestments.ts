import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { investmentsApi } from '@/lib/api/investments'
import type { CreateHoldingRequest, UpdateHoldingRequest } from '@/types/investments'

export function useHoldings() {
  return useQuery({
    queryKey: ['holdings'],
    queryFn: () => investmentsApi.getHoldings(),
  })
}

export function usePortfolioSummary() {
  return useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn: () => investmentsApi.getPortfolioSummary(),
  })
}

export function usePortfolioHoldings() {
  return useQuery({
    queryKey: ['portfolio', 'holdings'],
    queryFn: () => investmentsApi.getPortfolioHoldings(),
  })
}

export function useCreateHolding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateHoldingRequest) => investmentsApi.createHolding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holdings'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
    },
  })
}

export function useUpdateHolding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHoldingRequest }) =>
      investmentsApi.updateHolding(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holdings'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
    },
  })
}

export function useDeleteHolding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => investmentsApi.deleteHolding(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holdings'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
    },
  })
}
