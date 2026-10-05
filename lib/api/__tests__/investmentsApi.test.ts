import { describe, it, expect, vi } from 'vitest'
import { investmentsApi } from '../investments'
import { api, ApiError } from '../client'

vi.mock('../client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../client')>()),
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

  it('keeps the exact quantity the API sent next to the numeric one', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      content: [{ id: 8, bankNumber: '017', ticker: 'GGAL', assetType: 'STOCK', quantity: '123456789012.123456', avgPurchasePrice: '1', currency: 'ARS' }],
    })

    const [holding] = await investmentsApi.getHoldings()

    expect(holding.exactQuantity).toBe('123456789012.123456')
    expect(holding.quantity).toBe(123456789012.123456)
  })

  it('keeps the exact price and thresholds the API sent', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      content: [{
        id: 9, bankNumber: '017', ticker: 'GGAL', assetType: 'STOCK', quantity: '1', avgPurchasePrice: '123456789012.123456',
        currency: 'ARS', notifyGainThresholdPct: '12.5', notifyLossThresholdPct: null,
      }],
    })

    const [holding] = await investmentsApi.getHoldings()

    expect(holding.exactAvgPurchasePrice).toBe('123456789012.123456')
    expect(holding.exactNotifyGainThresholdPct).toBe('12.5')
    expect(holding.exactNotifyLossThresholdPct).toBeNull()
  })
})

describe('investmentsApi.sellHolding', () => {
  it('posts the quantity, price and destination to the sell endpoint', async () => {
    const sale = { holdingId: 7, soldQuantity: '10', remainingQuantity: '40', proceeds: '350000', bookedAmount: '350000', currency: 'ARS', closed: false }
    vi.mocked(api.post).mockResolvedValueOnce(sale)

    const result = await investmentsApi.sellHolding(7, { quantity: '10', price: '35000', destinationCbu: '0170099200000000000017' })

    expect(api.post).toHaveBeenCalledWith('/api/v1/investments/holdings/7/sell', {
      quantity: '10',
      price: '35000',
      destinationCbu: '0170099200000000000017',
    })
    expect(result).toEqual(sale)
  })

  it('propagates the API error when the sale exceeds the holding', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new ApiError('too many', 422, 'holding_sale_exceeds_quantity'))

    const sale = investmentsApi.sellHolding(7, { quantity: '60', price: null, destinationCbu: null })

    await expect(sale).rejects.toBeInstanceOf(ApiError)
    await expect(sale).rejects.toMatchObject({ status: 422, code: 'holding_sale_exceeds_quantity' })
  })
})
