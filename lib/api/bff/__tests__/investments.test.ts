import { describe, it, expect, vi } from 'vitest'
import { getInvestments } from '../investments'
import { api } from '@/lib/api/client'

vi.mock('@/lib/api/client', () => ({
  api: {
    get: vi.fn(),
  },
}))

describe('BFF Investments client', () => {
  it('sends the evolution range', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({})

    await getInvestments({ currency: 'USD_MEP', secondary: 'none', range: '3M' })

    expect(api.get).toHaveBeenCalledWith('/api/v1/bff/investments?currency=USD_MEP&secondary=none&range=3M')
  })

  it('defaults to ARS, no secondary and one month', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({})

    await getInvestments()

    expect(api.get).toHaveBeenCalledWith('/api/v1/bff/investments?currency=ARS&secondary=none&range=1M')
  })
})
