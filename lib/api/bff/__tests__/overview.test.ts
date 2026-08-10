import { describe, it, expect, vi } from 'vitest'
import { getOverview } from '../overview'
import { api } from '@/lib/api/client'

vi.mock('@/lib/api/client', () => ({
  api: {
    get: vi.fn(),
  },
}))

describe('BFF Overview client', () => {
  it('unwraps the envelope and keeps sections intact', async () => {
    const mockData = {
      kpis: {
        status: 'OK',
        observedAt: '2026-08-06T10:00:00Z',
        data: { cash: { amount: '10', currency: 'ARS', secondary: null } },
      },
    }
    vi.mocked(api.get).mockResolvedValueOnce(mockData)

    const page = await getOverview({ currency: 'ARS', secondary: 'none' })

    expect(page.kpis?.status).toBe('OK')
    expect(page.kpis?.data?.cash?.amount).toBe('10')
  })
})
