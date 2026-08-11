import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useSearch } from '../useSearch'
import fixture from '@/lib/api/bff/__fixtures__/search.json'

vi.mock('@/lib/api/bff/search', () => ({ getSearch: vi.fn(async () => fixture) }))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
)

describe('useSearch', () => {
  it('does not query for a single character', async () => {
    const spy = vi.mocked((await import('@/lib/api/bff/search')).getSearch)
    renderHook(() => useSearch('C'), { wrapper })
    await new Promise((r) => setTimeout(r, 400))
    expect(spy).not.toHaveBeenCalled()
  })

  it('returns the three grouped sections', async () => {
    const { result } = renderHook(() => useSearch('Coto'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(Object.keys(result.current.data!).sort()).toEqual(['categories', 'movements', 'positions'])
  })
})
