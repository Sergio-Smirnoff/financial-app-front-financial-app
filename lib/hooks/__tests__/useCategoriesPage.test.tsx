import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as bff from '@/lib/api/bff/categories'
import { useCategoriesPage } from '../useCategoriesPage'
import type { CategoriesBff } from '@/lib/api/bff/types'
import React from 'react'

const mockCategories: CategoriesBff = {
  categories: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: [
      {
        id: 1,
        name: 'Comida',
        icon: 'utensils',
        color: '#ff0000',
        spendThisMonth: { amount: '45000', currency: 'ARS', secondary: null },
        budgetMonthly: { amount: '40000', currency: 'ARS', secondary: null },
      },
    ],
  },
}

describe('useCategoriesPage', () => {
  it('keys the query by currency and period', async () => {
    const spy = vi.spyOn(bff, 'getCategories').mockResolvedValue(mockCategories)
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useCategoriesPage({ currency: 'ARS', secondary: 'none' }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
