import { api } from './client'
import type {
  AssetType,
  AllocationBreakdown,
  Holding,
  HoldingWithPrice,
  PortfolioSummary,
  PortfolioEvolution,
  MarketQuote,
  PriceHistory,
  CreateHoldingRequest,
  UpdateHoldingRequest,
  TickerSearchResult,
  TickerResearch,
} from '@/types/investments'

// ── Backend sends all money/numeric fields as decimal strings ("no BigDecimal on
// the wire"). These helpers parse them safely so undefined/null never reaches
// `.toFixed`/arithmetic in components.
const toNum = (v: string | null | undefined): number => Number(v ?? 0)
const toNumOrNull = (v: string | null | undefined): number | null =>
  v == null ? null : Number(v)

interface RawAllocationBreakdown {
  assetType: string
  totalValue: string
  percentage: string
}

interface RawCurrencyTotals {
  currency: string
  totalValue: string
  totalCost: string
  totalPl: string
  plPercent: string
  breakdown: RawAllocationBreakdown[]
}

interface RawPortfolioSummary {
  byCurrency: RawCurrencyTotals[]
}

interface RawHoldingWithPrice {
  id: number
  userId: number
  bankNumber: string
  ticker: string
  name: string
  assetType: string
  quantity: string
  avgPurchasePrice: string
  currency: string
  notifyGainThresholdPct: string | null
  notifyLossThresholdPct: string | null
  lastGainNotifiedAt: string | null
  lastLossNotifiedAt: string | null
  createdAt: string
  updatedAt: string
  currentPrice: string | null
  currentValue: string | null
  plAmount: string | null
  plPercent: string | null
}

interface RawCurrencyTotalsByDay {
  currency: string
  totalValue: string
}

interface RawPortfolioEvolution {
  date: string
  totals: RawCurrencyTotalsByDay[]
}

interface RawMarketQuote {
  ticker: string
  price: string
  currency: string
  variation: string
  volume: string
}

const BASE = '/api/v1/investments'

export const investmentsApi = {
  getHoldings: () =>
    api.get<Holding[]>(`${BASE}/holdings`),

  createHolding: (data: CreateHoldingRequest) =>
    api.post<Holding>(`${BASE}/holdings`, data),

  updateHolding: (id: number, data: UpdateHoldingRequest) =>
    api.put<Holding>(`${BASE}/holdings/${id}`, data),

  deleteHolding: (id: number, destinationCbu?: string) =>
    api.delete<void>(`${BASE}/holdings/${id}${destinationCbu ? `?destinationCbu=${destinationCbu}` : ''}`),

  getPortfolioSummary: async (): Promise<PortfolioSummary> => {
    // Backend returns { byCurrency: [{ currency, totalValue, totalPl, plPercent, breakdown }] }
    // with string values; the dashboard wants a flat ARS/USD shape with numbers.
    const raw = await api.get<RawPortfolioSummary>(`${BASE}/portfolio/summary`)
    const byCode = (code: string) => raw?.byCurrency?.find((c) => c.currency === code)
    const mapBreakdown = (c: RawCurrencyTotals | undefined, currency: string): AllocationBreakdown[] =>
      (c?.breakdown ?? []).map((b) => ({
        assetType: b.assetType,
        totalValue: toNum(b.totalValue),
        percentage: toNum(b.percentage),
        currency,
      }))
    const ars = byCode('ARS')
    const usd = byCode('USD')
    return {
      totalValueArs: toNum(ars?.totalValue),
      totalValueUsd: toNum(usd?.totalValue),
      totalPlArs: toNum(ars?.totalPl),
      totalPlUsd: toNum(usd?.totalPl),
      plPercentArs: toNum(ars?.plPercent),
      plPercentUsd: toNum(usd?.plPercent),
      breakdownArs: mapBreakdown(ars, 'ARS'),
      breakdownUsd: mapBreakdown(usd, 'USD'),
    }
  },

  getPortfolioEvolution: async (days: number = 30): Promise<PortfolioEvolution[]> => {
    // Backend returns [{ date, totals: [{ currency, totalValue }] }]; chart wants
    // flat per-day ARS/USD numbers.
    const raw = await api.get<RawPortfolioEvolution[]>(`${BASE}/portfolio/evolution?days=${days}`)
    return (raw ?? []).map((d) => {
      const valueOf = (code: string) => toNum(d.totals?.find((t) => t.currency === code)?.totalValue)
      return { date: d.date, totalValueArs: valueOf('ARS'), totalValueUsd: valueOf('USD') }
    })
  },

  getPortfolioHoldings: async (): Promise<HoldingWithPrice[]> => {
    const raw = await api.get<RawHoldingWithPrice[]>(`${BASE}/portfolio/holdings`)
    return (raw ?? []).map((h) => ({
      id: h.id,
      userId: h.userId,
      bankNumber: h.bankNumber,
      fundingCbu: null,
      ticker: h.ticker,
      name: h.name,
      assetType: h.assetType as AssetType,
      quantity: toNum(h.quantity),
      avgPurchasePrice: toNum(h.avgPurchasePrice),
      currency: h.currency,
      notifyGainThresholdPct: toNumOrNull(h.notifyGainThresholdPct),
      notifyLossThresholdPct: toNumOrNull(h.notifyLossThresholdPct),
      createdAt: h.createdAt,
      updatedAt: h.updatedAt,
      currentPrice: toNumOrNull(h.currentPrice),
      currentValue: toNumOrNull(h.currentValue),
      plAmount: toNumOrNull(h.plAmount),
      plPercent: toNumOrNull(h.plPercent),
      lastGainNotifiedAt: h.lastGainNotifiedAt,
      lastLossNotifiedAt: h.lastLossNotifiedAt,
    }))
  },

  getMarketDiscovery: async (limit: number = 5): Promise<MarketQuote[]> => {
    const raw = await api.get<RawMarketQuote[]>(`${BASE}/market/discovery?limit=${limit}`)
    return (raw ?? []).map((q) => ({
      ticker: q.ticker,
      price: toNum(q.price),
      variation: toNum(q.variation),
    }))
  },

  getPriceHistory: (ticker: string, from?: string, to?: string) => {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    const query = params.toString() ? `?${params}` : ''
    return api.get<PriceHistory[]>(`${BASE}/prices/history/${ticker}${query}`)
  },

  searchTickers: async (query: string): Promise<TickerSearchResult[]> => {
    const raw = await api.get<Array<{ ticker: string; price: string; currency: string; variation: string }>>(
      `${BASE}/market/search?q=${encodeURIComponent(query)}`,
    )
    return (raw ?? []).map((result) => ({
      ticker: result.ticker,
      price: toNum(result.price),
      currency: result.currency,
      variation: toNum(result.variation),
    }))
  },

  getTickerResearch: async (ticker: string, range = 'D90', assetType = 'STOCK'): Promise<TickerResearch> => {
    const raw = await api.get<{
      ticker: string
      currency: string | null
      currentPrice: string | null
      variation: string | null
      series: Array<{ date: string; price: string }>
    }>(`${BASE}/market/tickers/${encodeURIComponent(ticker)}?range=${range}&assetType=${assetType}`)
    return {
      ticker: raw.ticker,
      currency: raw.currency,
      currentPrice: toNumOrNull(raw.currentPrice),
      variation: toNumOrNull(raw.variation),
      series: (raw.series ?? []).map((point) => ({ date: point.date, price: toNum(point.price) })),
    }
  },
}
