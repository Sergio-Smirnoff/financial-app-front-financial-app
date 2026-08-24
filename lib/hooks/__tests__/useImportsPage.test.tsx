import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as bff from '@/lib/api/bff/imports'
import { useImportsPage } from '../useImportsPage'
import type { ImportsBff } from '@/lib/api/bff/types'
import React from 'react'

const mockImports: ImportsBff = {
  history: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: [
      {
        runId: 1,
        fileName: 'resumen-junio.csv',
        accountCbu: '0170001',
        status: 'SUCCESS',
        importedAt: new Date().toISOString(),
        inserted: 142,
        duplicates: 0,
        failed: 0,
      },
    ],
  },
}

describe('useImportsPage', () => {
  it('fetches imports history', async () => {
    const spy = vi.spyOn(bff, 'getImports').mockResolvedValue(mockImports)
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useImportsPage(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
