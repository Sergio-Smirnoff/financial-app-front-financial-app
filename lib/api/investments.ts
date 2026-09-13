import { api } from './client'
import type {
  Holding,
  CreateHoldingRequest,
  UpdateHoldingRequest,
  TickerSearchResult,
  TickerResearch,
  MarketDiscovery,
  PriceHistory,
} from '@/types/investments'

const toNum = (v: string | number | null | undefined): number => Number(v ?? 0)
const toNumOrNull = (v: string | number | null | undefined): number | null =>
  v == null ? null : Number(v)

interface RawHoldingResponse {
  id: number
  userId: number
  bankNumber: string
  fundingCbu?: string | null
  ticker: string
  name: string
  assetType: string
  quantity: string | number
  avgPurchasePrice: string | number
  currency: string
  notifyGainThresholdPct: string | number | null
  notifyLossThresholdPct: string | number | null
  createdAt: string
  updatedAt: string
}

interface RawTickerSearchResult {
  ticker: string
  name?: string
  price: string | number
  currency: string
  variation: string | number
}

interface RawTickerResearch {
  ticker: string
  currency: string | null
  currentPrice: string | number | null
  variation: string | number | null
  series: Array<{ date: string; price: string | number }>
}

interface RawMarketDiscovery {
  marketDataAvailable: boolean
  opportunities: Array<{
    ticker: string
    name?: string
    price: string | number
    currency?: string
    variation: string | number
    volume?: string
  }>
}

const BASE = '/api/v1/investments'

export const investmentsApi = {
  getHoldings: async (): Promise<Holding[]> => {
    const raw = await api.get<{ content?: RawHoldingResponse[] } | RawHoldingResponse[]>(`${BASE}/holdings`)
    const list = Array.isArray(raw) ? raw : (raw?.content ?? [])
    return list.map((h) => ({
      ...h,
      assetType: h.assetType as Holding['assetType'],
      quantity: toNum(h.quantity),
      avgPurchasePrice: toNum(h.avgPurchasePrice),
      notifyGainThresholdPct: toNumOrNull(h.notifyGainThresholdPct),
      notifyLossThresholdPct: toNumOrNull(h.notifyLossThresholdPct),
    }))
  },

  createHolding: (data: CreateHoldingRequest) =>
    api.post<Holding>(`${BASE}/holdings`, data),

  updateHolding: (id: number, data: UpdateHoldingRequest) =>
    api.put<Holding>(`${BASE}/holdings/${id}`, data),

  deleteHolding: (id: number, destinationCbu?: string) =>
    api.delete<void>(`${BASE}/holdings/${id}${destinationCbu ? `?destinationCbu=${encodeURIComponent(destinationCbu)}` : ''}`),

  getMarketDiscovery: async (limit: number = 5): Promise<MarketDiscovery> => {
    const raw = await api.get<RawMarketDiscovery>(`${BASE}/market/discovery?limit=${limit}`)
    const safe = raw ?? { marketDataAvailable: false, opportunities: [] }
    return {
      marketDataAvailable: safe.marketDataAvailable,
      opportunities: (safe.opportunities ?? []).map((o) => ({
        ticker: o.ticker,
        name: o.name,
        price: toNum(o.price),
        currency: o.currency ?? 'ARS',
        variation: toNum(o.variation),
      })),
    }
  },

  searchTickers: async (query: string): Promise<TickerSearchResult[]> => {
    if (!query || query.trim().length === 0) return []
    const raw = await api.get<RawTickerSearchResult[]>(
      `${BASE}/market/search?q=${encodeURIComponent(query.trim())}`,
    )
    return (raw ?? []).map((r) => ({
      ticker: r.ticker,
      name: r.name,
      price: toNum(r.price),
      currency: r.currency,
      variation: toNum(r.variation),
    }))
  },

  getTickerResearch: async (ticker: string, range = 'D90', assetType = 'STOCK'): Promise<TickerResearch> => {
    const raw = await api.get<RawTickerResearch>(
      `${BASE}/market/tickers/${encodeURIComponent(ticker)}?range=${range}&assetType=${assetType}`,
    )
    return {
      ticker: raw?.ticker ?? ticker,
      currency: raw?.currency ?? 'ARS',
      currentPrice: toNumOrNull(raw?.currentPrice),
      variation: toNumOrNull(raw?.variation),
      series: (raw?.series ?? []).map((pt) => ({
        date: pt.date,
        price: toNum(pt.price),
      })),
    }
  },

  getPriceHistory: (ticker: string, from?: string, to?: string) => {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    const query = params.toString() ? `?${params}` : ''
    return api.get<PriceHistory[]>(`${BASE}/prices/history/${encodeURIComponent(ticker)}${query}`)
  },
}
