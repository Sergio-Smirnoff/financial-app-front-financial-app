import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as bff from '@/lib/api/bff/overview'
import { useOverviewPage } from '../useOverviewPage'
import type { OverviewBff } from '@/lib/api/bff/types'
import React from 'react'

const mockOverview: OverviewBff = {
  kpis: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: {
      cash: { amount: '1284000', currency: 'ARS', secondary: null },
      income: { amount: '450000', currency: 'ARS', secondary: null },
      expense: { amount: '230000', currency: 'ARS', secondary: null },
      committed: { amount: '85000', currency: 'ARS', secondary: null },
    },
  },
  netWorth: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: {
      series: [{ date: '2026-08-01', value: { amount: '1284000', currency: 'ARS', secondary: null } }],
      delta: { amount: { amount: '54000', currency: 'ARS', secondary: null }, pct: 4.38 },
      allTimeHigh: true,
    },
  },
  breakdown: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: {
      investments: { amount: '500000', currency: 'ARS', secondary: null },
      cash: { amount: '784000', currency: 'ARS', secondary: null },
      debt: { amount: '0', currency: 'ARS', secondary: null },
      savings: { amount: '100000', currency: 'ARS', secondary: null },
    },
  },
  flow: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: [
      {
        month: '2026-08',
        income: { amount: '450000', currency: 'ARS', secondary: null },
        expense: { amount: '230000', currency: 'ARS', secondary: null },
      },
    ],
  },
  committed: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: [{ month: '2026-08', amount: { amount: '85000', currency: 'ARS', secondary: null } }],
  },
  upcomingPayments: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: [],
  },
  spendByCategory: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: [],
  },
  latestMovements: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: [],
  },
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return Wrapper
}

describe('useOverviewPage', () => {
  it('issues exactly one request per currency view', async () => {
    const spy = vi.spyOn(bff, 'getOverview').mockResolvedValue(mockOverview)
    const wrapper = createWrapper()
    const { result } = renderHook(() => useOverviewPage({ currency: 'ARS', secondary: 'none' }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({ currency: 'ARS', secondary: 'none' })
  })
})
