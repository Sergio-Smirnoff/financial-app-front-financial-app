import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as bff from '@/lib/api/bff/loans'
import { useLoanSchedule } from '../useLoanSchedule'
import type { LoanScheduleBff } from '@/lib/api/bff/types'
import React from 'react'

const mockSchedule: LoanScheduleBff = {
  installments: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: [
      {
        id: 11,
        number: 7,
        amount: { amount: '42000', currency: 'ARS', secondary: null },
        dueDate: '2026-09-10',
        paid: false,
      },
    ],
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

describe('useLoanSchedule', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('issues exactly one request for the selected loan', async () => {
    const spy = vi.spyOn(bff, 'getLoanSchedule').mockResolvedValue(mockSchedule)
    const wrapper = createWrapper()
    const { result } = renderHook(() => useLoanSchedule(7, { currency: 'ARS', secondary: 'none' }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(7, { currency: 'ARS', secondary: 'none' })
    expect(result.current.data?.installments?.data?.[0].number).toBe(7)
  })

  it('stays idle while no loan is selected', async () => {
    const spy = vi.spyOn(bff, 'getLoanSchedule').mockResolvedValue(mockSchedule)
    const wrapper = createWrapper()
    const { result } = renderHook(() => useLoanSchedule(0, { currency: 'ARS', secondary: 'none' }), { wrapper })

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'))
    expect(spy).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
  })
})
