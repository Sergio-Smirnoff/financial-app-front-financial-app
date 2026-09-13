import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { AreaChart } from '../AreaChart'

const series12 = [
  { date: '2026-01-01', value: 100 },
  { date: '2026-02-01', value: 120 },
  { date: '2026-03-01', value: 110 },
  { date: '2026-04-01', value: 130 },
  { date: '2026-05-01', value: 140 },
  { date: '2026-06-01', value: 135 },
  { date: '2026-07-01', value: 150 },
  { date: '2026-08-01', value: 160 },
  { date: '2026-09-01', value: 155 },
  { date: '2026-10-01', value: 170 },
  { date: '2026-11-01', value: 180 },
  { date: '2026-12-01', value: 200 }
]

const cost12 = series12.map((p) => ({ ...p, value: p.value * 0.9 }))

describe('AreaChart', () => {
  it('renders vertices count equal to series length', () => {
    const { container } = render(<AreaChart series={series12} currency="ARS" ariaLabel="Patrimonio neto" />)
    const vertices = container.querySelectorAll('circle[data-role="vertex"]')
    expect(vertices).toHaveLength(12)
  })

  it('renders axes with tick labels', () => {
    render(<AreaChart series={series12} currency="ARS" ariaLabel="Patrimonio neto" />)
    expect(screen.getAllByTestId('tick-x').length).toBeGreaterThan(2)
    expect(screen.getAllByTestId('tick-y').length).toBeGreaterThan(2)
  })

  it('states date, value and delta on hover in text', async () => {
    render(<AreaChart series={series12} currency="ARS" ariaLabel="Patrimonio neto" />)
    await userEvent.hover(screen.getByTestId('hover-area'))
    expect(screen.getByRole('tooltip')).toHaveTextContent(/\d{2}\/\d{2}.*\$.*[+−]/)
  })

  it('draws the comparison series dashed', () => {
    const { container } = render(<AreaChart series={series12} comparison={cost12} currency="ARS" ariaLabel="Cartera" />)
    expect(container.querySelector('path[data-role="comparison"]')).toHaveAttribute('stroke-dasharray')
  })

  it('ensures Y-axis tick labels remain within visible viewport bounds', () => {
    render(<AreaChart series={series12} currency="ARS" ariaLabel="Patrimonio neto" />)
    const yTicks = screen.getAllByTestId('tick-y')
    for (const tick of yTicks) {
      const text = tick.querySelector('text')
      const xAttr = parseFloat(text?.getAttribute('x') || '0')
      expect(xAttr).toBeGreaterThanOrEqual(40)
    }
  })

  it('handles unsorted series chronologically and uses straight segments for sparse points', () => {
    const unsortedSparse = [
      { date: '2026-03-01', value: 200 },
      { date: '2026-01-01', value: 100 },
    ]
    const { container } = render(<AreaChart series={unsortedSparse} currency="ARS" ariaLabel="Sparse" />)
    const linePath = container.querySelector('path[data-role="line"]')?.getAttribute('d')
    expect(linePath).toMatch(/^M[\d.,\s]+L[\d.,\s]+$/)
  })

  it('handles single point without collapsing scale', () => {
    const single = [{ date: '2026-01-01', value: 150 }]
    const { container } = render(<AreaChart series={single} currency="ARS" ariaLabel="Single" />)
    const vertices = container.querySelectorAll('circle[data-role="vertex"]')
    expect(vertices).toHaveLength(1)
  })
})
