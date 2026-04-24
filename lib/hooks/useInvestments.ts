import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { investmentsApi } from '@/lib/api/investments'
import type { CreateHoldingRequest, UpdateHoldingRequest } from '@/types/investments'

export function usePriceHistory(ticker: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ['priceHistory', ticker, from, to],
    queryFn: () => investmentsApi.getPriceHistory(ticker, from, to),
    enabled: !!ticker,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useHoldings() {
  return useQuery({
    queryKey: ['holdings'],
    queryFn: () => investmentsApi.getHoldings(),
  })
}

export function usePortfolioSummary(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn: () => investmentsApi.getPortfolioSummary(),
    enabled: options?.enabled ?? true,
  })
}

export function usePortfolioEvolution(days: number = 30) {
  return useQuery({
    queryKey: ['portfolio', 'evolution', days],
    queryFn: () => investmentsApi.getPortfolioEvolution(days),
  })
}

export function usePortfolioHoldings(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['portfolio', 'holdings'],
    queryFn: () => investmentsApi.getPortfolioHoldings(),
    enabled: options?.enabled ?? true,
  })
}

export function useMarketDiscovery(limit: number = 5) {
  return useQuery({
    queryKey: ['market', 'discovery', limit],
    queryFn: () => investmentsApi.getMarketDiscovery(limit),
  })
}

export function useCreateHolding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateHoldingRequest) => investmentsApi.createHolding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holdings'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      queryClient.invalidateQueries({ queryKey: ['banks'] })
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
      queryClient.invalidateQueries({ queryKey: ['banks'] })
    },
  })
}

export function useDeleteHolding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, destinationAccountId }: { id: number; destinationAccountId?: number }) => 
        investmentsApi.deleteHolding(id, destinationAccountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holdings'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      queryClient.invalidateQueries({ queryKey: ['banks'] })
    },
  })
}
