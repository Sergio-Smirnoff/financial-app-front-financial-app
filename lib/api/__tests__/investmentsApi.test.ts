import { describe, it, expect, vi } from 'vitest'
import { investmentsApi } from '../investments'
import { api } from '../client'

vi.mock('../client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
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

describe('investmentsApi.sellHolding', () => {
  it('posts the quantity, price and destination to the sell endpoint', async () => {
    const sale = { holdingId: 7, soldQuantity: '10', remainingQuantity: '40', proceeds: '350000', bookedAmount: '350000', currency: 'ARS', closed: false }
    vi.mocked(api.post).mockResolvedValueOnce(sale)

    const result = await investmentsApi.sellHolding(7, { quantity: 10, price: 35000, destinationCbu: '0170099200000000000017' })

    expect(api.post).toHaveBeenCalledWith('/api/v1/investments/holdings/7/sell', {
      quantity: 10,
      price: 35000,
      destinationCbu: '0170099200000000000017',
    })
    expect(result).toEqual(sale)
  })
})
