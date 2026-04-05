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
  createdAt: string
  updatedAt: string
}

export interface HoldingWithPrice extends Holding {
  currentPrice: number | null
  currentValue: number | null
  plAmount: number | null
  plPercent: number | null
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
}

export type UpdateHoldingRequest = CreateHoldingRequest
