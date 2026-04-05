import { api } from './client'
import type {
  Holding,
  HoldingWithPrice,
  PortfolioSummary,
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
}
