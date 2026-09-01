import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as bff from '@/lib/api/bff/loans'
import { useLoansPage } from '../useLoansPage'
import type { LoansBff } from '@/lib/api/bff/types'
import React from 'react'

const mockLoans: LoansBff = {
  kpis: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: {
      totalOutstanding: { amount: '500000', currency: 'ARS', secondary: null },
      monthlyPayment: { amount: '42000', currency: 'ARS', secondary: null },
      activeLoans: 2,
      nextDueDate: '2026-09-10',
    },
  },
  loans: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: [
      {
        id: 1,
        label: 'Personal Galicia',
        bankNumber: '0070000',
        principal: { amount: '600000', currency: 'ARS', secondary: null },
        outstanding: { amount: '350000', currency: 'ARS', secondary: null },
        interestRate: 62.5,
        installmentsPaid: 6,
        installmentsTotal: 24,
        nextInstallmentDate: '2026-09-10',
        nextInstallmentAmount: { amount: '42000', currency: 'ARS', secondary: null },
        active: true,
      },
    ],
  },
  payFromAccounts: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: [{ cbu: '0070000000000000000001', alias: 'mi.cuenta.galicia' }],
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

describe('useLoansPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('issues exactly one request per currency view', async () => {
    const spy = vi.spyOn(bff, 'getLoans').mockResolvedValue(mockLoans)
    const wrapper = createWrapper()
    const { result } = renderHook(() => useLoansPage({ currency: 'ARS', secondary: 'none' }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({ currency: 'ARS', secondary: 'none' })
  })

  it('defaults the query to the ARS view when none is given', async () => {
    const spy = vi.spyOn(bff, 'getLoans').mockResolvedValue(mockLoans)
    const wrapper = createWrapper()
    const { result } = renderHook(() => useLoansPage(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ currency: 'ARS', secondary: 'none' })
    expect(result.current.data?.kpis?.data?.activeLoans).toBe(2)
  })
})
