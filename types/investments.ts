export type AssetType = 'STOCK' | 'BOND' | 'CEDEAR' | 'FCI'

export interface Holding {
  id: number
  userId: number
  ticker: string
  name: string
  assetType: AssetType
  quantity: number
  avgPurchasePrice: number
  currency: string
  notifyGainThresholdPct: number | null
  notifyLossThresholdPct: number | null
  createdAt: string
  updatedAt: string
}

export interface HoldingWithPrice extends Holding {
  currentPrice: number | null
  currentValue: number | null
  plAmount: number | null
  plPercent: number | null
  lastGainNotifiedAt: string | null
  lastLossNotifiedAt: string | null
}

export interface PriceHistory {
  ticker: string
  lastPrice: number
  openPrice: number | null
  highPrice: number | null
  lowPrice: number | null
  volume: number | null
  dailyVariation: number | null
  currency: string
  pricedAt: string
}

export interface AllocationBreakdown {
  assetType: AssetType
  totalValue: number
  currency: string
  percentage: number
}

export interface PortfolioSummary {
  totalValueArs: number
  totalValueUsd: number
  totalPlArs: number
  totalPlUsd: number
  plPercentArs: number
  plPercentUsd: number
  breakdownArs: AllocationBreakdown[]
  breakdownUsd: AllocationBreakdown[]
}

export interface CreateHoldingRequest {
  ticker: string
  name: string
  assetType: AssetType
  quantity: number
  avgPurchasePrice: number
  currency: string
  notifyGainThresholdPct?: number
  notifyLossThresholdPct?: number
}

export type UpdateHoldingRequest = CreateHoldingRequest
