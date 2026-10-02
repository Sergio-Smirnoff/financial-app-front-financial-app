import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { stubChartSize } from '@/test/chartSize'
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
  beforeEach(() => stubChartSize(640, 240))
  afterEach(() => vi.unstubAllGlobals())

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

  it('keeps axis labels at the same pixel offset at any card width', () => {
    const labelOffsets = (width: number) => {
      vi.unstubAllGlobals()
      stubChartSize(width, 240)
      const { container, unmount } = render(<AreaChart series={series12} currency="ARS" ariaLabel="Patrimonio neto" />)
      const offsets = [...container.querySelectorAll('[data-testid="tick-y"] text')].map((t) => t.getAttribute('x'))
      unmount()
      return offsets
    }
    const narrow = labelOffsets(320)
    const wide = labelOffsets(960)
    expect(narrow.length).toBeGreaterThan(2)
    expect(new Set([...narrow, ...wide])).toEqual(new Set(['48']))
  })

  it('draws at the size of its card', () => {
    vi.unstubAllGlobals()
    stubChartSize(960, 300)
    render(<AreaChart series={series12} currency="ARS" ariaLabel="Patrimonio neto" />)
    const svg = screen.getByRole('img', { name: 'Patrimonio neto' })
    expect(svg).toHaveAttribute('width', '960')
    expect(svg).toHaveAttribute('height', '300')
    expect(screen.getByTestId('hover-area')).toHaveAttribute('width', String(960 - 56 - 24))
  })

  it('flips the tooltip left near the right edge of a narrow card', async () => {
    vi.unstubAllGlobals()
    stubChartSize(320, 240)
    render(<AreaChart series={series12} currency="ARS" ariaLabel="Patrimonio neto" />)
    const transform = screen.getByRole('tooltip').getAttribute('transform') ?? ''
    const tooltipX = Number(/translate\(([-\d.]+)/.exec(transform)?.[1])
    expect(tooltipX + 130).toBeLessThanOrEqual(320)
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

  it('labels the value axis compactly for large amounts', () => {
    const large = [
      { date: '2026-01-01', value: 8e7 },
      { date: '2026-02-01', value: 9.74e7 },
    ]
    render(<AreaChart series={large} currency="ARS" ariaLabel="Patrimonio neto" />)
    expect(screen.getByText('$80M')).toBeInTheDocument()
    expect(screen.queryByText(/\d{4,}k/)).not.toBeInTheDocument()
  })

  it('keeps a decimal on the value axis when the range is narrow', () => {
    const narrow = [
      { date: '2026-01-01', value: 10 },
      { date: '2026-02-01', value: 11 },
    ]
    render(<AreaChart series={narrow} currency="ARS" ariaLabel="Precio" />)
    const labels = screen.getAllByTestId('tick-y').map((tick) => tick.textContent)
    expect(labels.length).toBeGreaterThan(2)
    expect(new Set(labels).size).toBe(labels.length)
    expect(labels.some((label) => /^\$10,\d$/.test(label ?? ''))).toBe(true)
  })

  it('labels sub-unit prices instead of printing $0', () => {
    const subUnit = [
      { date: '2026-01-01', value: 0.2 },
      { date: '2026-02-01', value: 0.8 },
    ]
    render(<AreaChart series={subUnit} currency="USD" ariaLabel="Precio" />)
    const labels = screen.getAllByTestId('tick-y').map((tick) => tick.textContent)
    expect(labels).toContain('US$0,4')
    expect(labels).not.toContain('US$0')
  })

  it('marks the point under the pointer', () => {
    vi.unstubAllGlobals()
    stubChartSize(640, 240)
    render(<AreaChart series={series12} currency="ARS" ariaLabel="Patrimonio neto" />)
    const hoverArea = screen.getByTestId('hover-area')
    vi.spyOn(hoverArea, 'getBoundingClientRect').mockReturnValue({ left: 100, top: 0, width: 560, height: 240 } as DOMRect)
    fireEvent.mouseMove(hoverArea, { clientX: 100 })
    expect(screen.getByRole('tooltip')).toHaveTextContent(/\$\s100\b/)
    fireEvent.mouseMove(hoverArea, { clientX: 100 + 560 })
    expect(screen.getByRole('tooltip')).toHaveTextContent(/\$\s200\b/)
  })

  it('keeps its plot inside the card when the card is narrower than the padding', () => {
    vi.unstubAllGlobals()
    stubChartSize(60, 50)
    const { container } = render(<AreaChart series={series12} currency="ARS" ariaLabel="Patrimonio neto" />)
    const xs = [...container.querySelectorAll('circle[data-role="vertex"]')].map((c) => Number(c.getAttribute('cx')))
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(56)
    const transform = screen.getByRole('tooltip').getAttribute('transform') ?? ''
    expect(Number(/translate\(([-\d.]+)/.exec(transform)?.[1])).toBeGreaterThanOrEqual(0)
  })
})
