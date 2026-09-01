import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useRecordTransaction } from '../useTransactions'

vi.mock('@/lib/api/transactions', () => ({
  transactionsApi: { record: vi.fn(async () => ({ id: 1 })) },
}))

describe('useRecordTransaction cache invalidation', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('invalidates bff page queries, not the deleted dashboard key', async () => {
    const queryClient = new QueryClient()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useRecordTransaction(), { wrapper })
    result.current.mutate({ description: 'x', amount: '10.00' } as never)
    await vi.waitFor(() => expect(result.current.isSuccess).toBe(true))

    const keys = spy.mock.calls.map(([arg]) => JSON.stringify(arg?.queryKey))
    expect(keys).toContain(JSON.stringify(['transactions']))
    expect(keys).toContain(JSON.stringify(['bff']))
    expect(keys).not.toContain(JSON.stringify(['dashboard']))

    await vi.advanceTimersByTimeAsync(5000)
    const lateKeys = spy.mock.calls.map(([arg]) => JSON.stringify(arg?.queryKey))
    expect(lateKeys).toContain(JSON.stringify(['bff', 'banks']))
  })
})
