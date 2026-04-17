import { api } from './client'
import type {
  Holding,
  HoldingWithPrice,
  PortfolioSummary,
  PriceHistory,
  CreateHoldingRequest,
  UpdateHoldingRequest,
} from '@/types/investments'

const BASE = '/api/v1/investments'

export const investmentsApi = {
  getHoldings: () =>
    api.get<Holding[]>(`${BASE}/holdings`),

  createHolding: (data: CreateHoldingRequest) =>
    api.post<Holding>(`${BASE}/holdings`, data),

  updateHolding: (id: number, data: UpdateHoldingRequest) =>
    api.put<Holding>(`${BASE}/holdings/${id}`, data),

  deleteHolding: (id: number) =>
    api.delete<void>(`${BASE}/holdings/${id}`),

  getPortfolioSummary: () =>
    api.get<PortfolioSummary>(`${BASE}/portfolio/summary`),

  getPortfolioHoldings: () =>
    api.get<HoldingWithPrice[]>(`${BASE}/portfolio/holdings`),

  getPriceHistory: (ticker: string, from?: string, to?: string) => {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    const query = params.toString() ? `?${params}` : ''
    return api.get<PriceHistory[]>(`${BASE}/prices/history/${ticker}${query}`)
  },
}
