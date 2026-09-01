import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as bff from '@/lib/api/bff/settings'
import { useSettingsPage } from '../useSettingsPage'
import type { SettingsBff } from '@/lib/api/bff/types'
import React from 'react'

const mockSettings: SettingsBff = {
  profile: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: { email: 'user@test.com', name: 'Ana Pérez' },
  },
  preferences: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: { primaryCurrency: 'ARS' },
  },
  sessions: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: [{ id: '1', device: 'Chrome / Linux', current: true, lastSeenAt: new Date().toISOString() }],
  },
}

describe('useSettingsPage', () => {
  it('fetches settings data', async () => {
    const spy = vi.spyOn(bff, 'getSettings').mockResolvedValue(mockSettings)
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useSettingsPage(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
