import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as bff from '@/lib/api/bff/transactions'
import { useTransactionsPage } from '../useTransactionsPage'
import { useTransactionDetail } from '../useTransactionDetail'
import type { TransactionsBff } from '@/lib/api/bff/types'
import React from 'react'

const mockBff: TransactionsBff = {
  filters: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: { categories: [{ id: 1, name: 'Comida' }], accounts: [{ cbu: '0170001', alias: 'galicia.ars' }] },
  },
  movements: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: { items: [], page: 1, totalPages: 1, totalCount: 0 },
  },
}

describe('useTransactionsPage & useTransactionDetail', () => {
  it('keys the query by every filter', async () => {
    const spy = vi.spyOn(bff, 'getTransactions').mockResolvedValue(mockBff)
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(
      () => useTransactionsPage({ page: 2, q: 'super', accountCbu: '0170001' }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryCache().findAll({ queryKey: ['bff', 'transactions'] })).toHaveLength(1)
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ page: 2, q: 'super', accountCbu: '0170001' }))
  })

  it('does not fetch the detail until a row is selected', () => {
    const detailSpy = vi.spyOn(bff, 'getTransactionDetail').mockResolvedValue({})
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    renderHook(() => useTransactionDetail(null), { wrapper })
    expect(detailSpy).not.toHaveBeenCalled()
  })
})
