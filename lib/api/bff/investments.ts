import { api } from '@/lib/api/client'
import { API_CONFIG } from '@/lib/api/config'
import type { InvestmentsBff, BffQuery } from './types'

export const EVOLUTION_RANGES = ['1M', '3M', '1A'] as const

export type EvolutionRange = (typeof EVOLUTION_RANGES)[number]

export interface InvestmentsQuery extends BffQuery {
  range?: EvolutionRange
}

export function getInvestments({ currency = 'ARS', secondary = 'none', range = '1M' }: InvestmentsQuery = {}) {
  return api.get<InvestmentsBff>(
    `${API_CONFIG.ENDPOINTS.BFF}/investments?currency=${currency}&secondary=${secondary}&range=${range}`,
  )
}
