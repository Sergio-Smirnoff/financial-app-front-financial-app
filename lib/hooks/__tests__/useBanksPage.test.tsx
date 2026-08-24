import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as bff from '@/lib/api/bff/banks'
import { useBanksPage } from '../useBanksPage'
import type { BanksBff } from '@/lib/api/bff/types'
import React from 'react'

const mockBanks: BanksBff = {
  kpis: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: {
      totalCash: { amount: '1200000', currency: 'ARS', secondary: null },
      accountCount: 3,
      cardDebt: { amount: '0', currency: 'ARS', secondary: null },
      loanBalance: { amount: '350000', currency: 'ARS', secondary: null },
    },
  },
  accounts: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: [],
  },
  cards: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: [],
  },
  loans: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: [],
  },
}

describe('useBanksPage', () => {
  it('invalidates the page query after a mutation', async () => {
    const spy = vi.spyOn(bff, 'getBanks').mockResolvedValue(mockBanks)
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useBanksPage({ currency: 'ARS', secondary: 'none' }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledTimes(1)

    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: ['bff', 'banks'] })
    })

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(2))
  })
})
