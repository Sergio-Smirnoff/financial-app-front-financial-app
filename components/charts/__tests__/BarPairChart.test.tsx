import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithIntl } from '@/test/intl'
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { stubChartSize } from '@/test/chartSize'
import { BarPairChart } from '../BarPairChart'
import { HorizonBars } from '../HorizonBars'

const months12 = [
  { month: '2026-01', income: 5000, expense: 3500 },
  { month: '2026-02', income: 5200, expense: 3400 },
  { month: '2026-03', income: 4800, expense: 3800 },
  { month: '2026-04', income: 5100, expense: 3600 },
  { month: '2026-05', income: 5300, expense: 3900 },
  { month: '2026-06', income: 5500, expense: 4000 },
  { month: '2026-07', income: 5400, expense: 3700 },
  { month: '2026-08', income: 5600, expense: 4100 },
  { month: '2026-09', income: 5700, expense: 4200 },
  { month: '2026-10', income: 5800, expense: 4300 },
  { month: '2026-11', income: 6000, expense: 4500 },
  { month: '2026-12', income: 6200, expense: 4600 }
]

const committed12 = [
  { month: '2026-01', amount: 10000 },
  { month: '2026-02', amount: 9000 },
  { month: '2026-03', amount: 8500 },
  { month: '2026-04', amount: 8000 },
  { month: '2026-05', amount: 7500 },
  { month: '2026-06', amount: 7000 },
  { month: '2026-07', amount: 6500 },
  { month: '2026-08', amount: 6000 },
  { month: '2026-09', amount: 5000 },
  { month: '2026-10', amount: 4000 },
  { month: '2026-11', amount: 3000 },
  { month: '2026-12', amount: 2000 }
]

describe('BarPairChart & HorizonBars', () => {
  beforeEach(() => stubChartSize(640, 240))
  afterEach(() => vi.unstubAllGlobals())

  it('renders 12 month pairs and highlights the current month', () => {
    renderWithIntl(<BarPairChart months={months12} currency="ARS" highlightMonth="2026-08" ariaLabel="Ingresos vs egresos" />)
    expect(screen.getAllByTestId('bar-income')).toHaveLength(12)
    expect(screen.getByTestId('bar-group-2026-08')).toHaveAttribute('data-current', 'true')
  })

  it('descends tone with amount', () => {
    const { container } = renderWithIntl(<HorizonBars months={committed12} currency="ARS" ariaLabel="Comprometido" />)
    const bars = [...container.querySelectorAll('[data-step]')].map((b) => Number(b.getAttribute('data-step')))
    expect(bars).toEqual([...bars].sort((a, b) => b - a))
  })

  it('labels the flow axis compactly for large amounts', () => {
    renderWithIntl(
      <BarPairChart
        months={[{ month: '2026-09', income: 8e7, expense: 7.5e7 }]}
        currency="ARS"
        ariaLabel="Flujo"
      />
    )
    expect(screen.getByText('$80M')).toBeInTheDocument()
    expect(screen.queryByText(/\d{4,}k/)).not.toBeInTheDocument()
  })

  it('labels the committed axis compactly in dollars', () => {
    renderWithIntl(<HorizonBars months={[{ month: '2026-09', amount: 8e7 }]} currency="USD" ariaLabel="Comprometido" />)
    expect(screen.getByText('US$80M')).toBeInTheDocument()
  })

  it('never draws an inverted bar in a card narrower than its padding', () => {
    vi.unstubAllGlobals()
    stubChartSize(40, 40)
    const { container } = renderWithIntl(
      <>
        <BarPairChart months={months12} currency="ARS" ariaLabel="Flujo" />
        <HorizonBars months={committed12} currency="ARS" ariaLabel="Comprometido" />
      </>
    )
    const rects = [...container.querySelectorAll('rect')]
    expect(rects.length).toBeGreaterThan(0)
    for (const rect of rects) {
      expect(Number(rect.getAttribute('width') ?? 0)).toBeGreaterThanOrEqual(0)
      expect(Number(rect.getAttribute('height') ?? 0)).toBeGreaterThanOrEqual(0)
    }
  })
})
