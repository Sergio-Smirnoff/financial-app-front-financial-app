import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useDeleteLoan, usePayLoanInstallment } from '../useLoans'

const { deleteLoan, payInstallment } = vi.hoisted(() => ({
  deleteLoan: vi.fn(),
  payInstallment: vi.fn(),
}))

vi.mock('@/lib/api/loans', () => ({
  loansApi: {
    delete: deleteLoan,
    payInstallment,
  },
}))

function renderWithClient<TResult>(hook: () => TResult) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const spy = vi.spyOn(queryClient, 'invalidateQueries')
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  const { result } = renderHook(hook, { wrapper })
  const invalidatedKeys = () => spy.mock.calls.map(([arg]) => JSON.stringify(arg?.queryKey))
  return { result, invalidatedKeys }
}

describe('useLoans mutation cache invalidation', () => {
  beforeEach(() => {
    deleteLoan.mockReset().mockResolvedValue(undefined)
    payInstallment.mockReset().mockResolvedValue({ id: 12 })
  })

  it('refreshes the loans and banks BFF pages after a loan is deleted', async () => {
    const { result, invalidatedKeys } = renderWithClient(() => useDeleteLoan())

    await result.current.mutateAsync(1)

    expect(deleteLoan).toHaveBeenCalledWith(1)
    const keys = invalidatedKeys()
    expect(keys).toContain(JSON.stringify(['bff', 'loans']))
    expect(keys).toContain(JSON.stringify(['bff', 'banks']))
    expect(keys).not.toContain(JSON.stringify(['loans']))
    expect(keys).not.toContain(JSON.stringify(['banks']))
  })

  it('refreshes loans, banks and transactions after an installment is paid', async () => {
    const { result, invalidatedKeys } = renderWithClient(() => usePayLoanInstallment())

    await result.current.mutateAsync({
      loanId: 1,
      installmentId: 12,
      accountCbu: '0170099220000012345678',
    })

    expect(payInstallment).toHaveBeenCalledWith(1, 12, '0170099220000012345678', undefined)
    const keys = invalidatedKeys()
    expect(keys).toContain(JSON.stringify(['bff', 'loans']))
    expect(keys).toContain(JSON.stringify(['bff', 'banks']))
    expect(keys).toContain(JSON.stringify(['bff', 'transactions']))
    expect(keys).toContain(JSON.stringify(['transactions', 'account', '0170099220000012345678']))
    expect(keys).not.toContain(JSON.stringify(['loans']))
    expect(keys).not.toContain(JSON.stringify(['banks']))
    expect(keys).not.toContain(JSON.stringify(['loans', 1, 'installments']))
  })
})
