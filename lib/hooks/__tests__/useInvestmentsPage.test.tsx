import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as bff from '@/lib/api/bff/investments'
import { useInvestmentsPage } from '../useInvestmentsPage'
import type { InvestmentsBff } from '@/lib/api/bff/types'
import React from 'react'

const mockInvestments: InvestmentsBff = {
  kpis: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: {
      cost: { amount: '1500000', currency: 'ARS', secondary: null },
      marketValue: { amount: '1750000', currency: 'ARS', secondary: null },
      pnl: { amount: '250000', currency: 'ARS', secondary: null },
      pnlPct: 16.67,
    },
  },
  positions: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: [],
  },
  composition: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: [],
  },
}

describe('useInvestmentsPage', () => {
  it('keys query by currency and secondary', async () => {
    const spy = vi.spyOn(bff, 'getInvestments').mockResolvedValue(mockInvestments)
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useInvestmentsPage({ currency: 'ARS', secondary: 'none' }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
