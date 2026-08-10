import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PositionDetail } from '../PositionDetail'
import React from 'react'

const holdingFixture = {
  id: 42,
  ticker: 'YPFD',
  name: 'YPF S.A.',
  assetType: 'Acción',
  quantity: 100,
  avgPrice: { amount: '12000', currency: 'ARS', secondary: null },
  currentPrice: { amount: '15000', currency: 'ARS', secondary: null },
  totalValue: { amount: '1500000', currency: 'ARS', secondary: null },
  pnl: { amount: { amount: '300000', currency: 'ARS', secondary: null }, pct: 25 },
  prices: [
    { date: '2026-08-01', value: 12000 },
    { date: '2026-08-02', value: 13500 },
    { date: '2026-08-03', value: 15000 },
  ],
}

describe('PositionDetail', () => {
  it('renders the price chart with axes', () => {
    render(<PositionDetail holding={holdingFixture} />)
    expect(screen.getAllByTestId('tick-y').length).toBeGreaterThan(2)
  })

  it('plots exactly the delivered price points', () => {
    const { container } = render(<PositionDetail holding={holdingFixture} />)
    const path = container.querySelector('path[data-role="line"]')!.getAttribute('d')!
    expect(path.match(/[ML]/g)).toHaveLength(holdingFixture.prices.length)
  })
})
