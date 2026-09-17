import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { investmentsApi } from '@/lib/api/investments'
import type {
  Holding,
  CreateHoldingRequest,
  UpdateHoldingRequest,
  TickerSearchResult,
  TickerResearch,
  MarketDiscovery,
} from '@/types/investments'

export function useHoldings() {
  return useQuery<Holding[]>({
    queryKey: ['holdings'],
    queryFn: () => investmentsApi.getHoldings(),
  })
}

export function useCreateHolding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateHoldingRequest) => investmentsApi.createHolding(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holdings'] })
      queryClient.invalidateQueries({ queryKey: ['bff', 'investments'] })
      queryClient.invalidateQueries({ queryKey: ['bff', 'overview'] })
      queryClient.invalidateQueries({ queryKey: ['bff', 'banks'] })
      queryClient.invalidateQueries({ queryKey: ['banks'] })
      queryClient.invalidateQueries({ queryKey: ['bff', 'transactions'] })
    },
  })
}

export function useUpdateHolding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateHoldingRequest }) =>
      investmentsApi.updateHolding(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holdings'] })
      queryClient.invalidateQueries({ queryKey: ['bff', 'investments'] })
      queryClient.invalidateQueries({ queryKey: ['bff', 'overview'] })
    },
  })
}

export function useDeleteHolding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, destinationCbu }: { id: number; destinationCbu?: string }) =>
      investmentsApi.deleteHolding(id, destinationCbu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holdings'] })
      queryClient.invalidateQueries({ queryKey: ['bff', 'investments'] })
      queryClient.invalidateQueries({ queryKey: ['bff', 'overview'] })
      queryClient.invalidateQueries({ queryKey: ['bff', 'banks'] })
      queryClient.invalidateQueries({ queryKey: ['banks'] })
      queryClient.invalidateQueries({ queryKey: ['bff', 'transactions'] })
    },
  })
}

export function useTickerSearch(query: string) {
  const [debounced, setDebounced] = useState(query)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 200)
    return () => clearTimeout(t)
  }, [query])

  return useQuery<TickerSearchResult[]>({
    queryKey: ['market', 'search', debounced],
    queryFn: () => investmentsApi.searchTickers(debounced),
    enabled: debounced.trim().length >= 1,
    staleTime: 60_000,
  })
}

export function useTickerResearch(ticker: string | null, range = 'D90', assetType = 'STOCK') {
  return useQuery<TickerResearch>({
    queryKey: ['market', 'ticker', ticker, range, assetType],
    queryFn: () => investmentsApi.getTickerResearch(ticker!, range, assetType),
    enabled: !!ticker,
    staleTime: 60_000,
  })
}

export function useMarketDiscovery(limit = 5) {
  return useQuery<MarketDiscovery>({
    queryKey: ['market', 'discovery', limit],
    queryFn: () => investmentsApi.getMarketDiscovery(limit),
    staleTime: 120_000,
  })
}
