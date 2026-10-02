import { describe, it, expect, vi } from 'vitest'
import { investmentsApi } from '../investments'
import { api } from '../client'

vi.mock('../client', () => ({
  api: {
    get: vi.fn(),
  },
}))

describe('investmentsApi.getHoldings', () => {
  it('asks for every holding in one page and coerces numbers', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      content: [{ id: 7, bankNumber: '017', ticker: 'GD30', assetType: 'BOND', quantity: '862', avgPurchasePrice: '802.16', currency: 'ARS' }],
    })

    const holdings = await investmentsApi.getHoldings()

    expect(api.get).toHaveBeenCalledWith('/api/v1/investments/holdings?size=500')
    expect(holdings[0]).toMatchObject({ id: 7, quantity: 862, avgPurchasePrice: 802.16 })
  })
})
