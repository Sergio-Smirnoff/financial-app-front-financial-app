import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { DonutChart, type DonutSlice } from '../DonutChart'
import { stubChartSize } from '@/test/chartSize'

const slices: DonutSlice[] = [
  { key: 'BOND', label: 'Bonos', value: 4530, pct: 45.3, color: 'var(--chart-5)' },
  { key: 'CEDEAR', label: 'CEDEARs', value: 4010, pct: 40.1, color: 'var(--chart-4)' },
  { key: 'STOCK', label: 'Acciones', value: 250, pct: 2.5, color: 'var(--chart-1)' },
  { key: 'FCI', label: 'Fondos (FCI)', value: 1210, pct: 12.1, color: 'var(--chart-2)' },
]

function renderDonut(override: Partial<React.ComponentProps<typeof DonutChart>> = {}) {
  return render(
    <DonutChart
      slices={slices}
      ariaLabel="Composición"
      centerLabel="TOTAL"
      centerValue="$10,7M"
      centerDelta={{ text: '+4,20 %', tone: 'gain' }}
      {...override}
    />,
  )
}

describe('DonutChart', () => {
  beforeEach(() => stubChartSize(320, 240))
  afterEach(() => vi.unstubAllGlobals())

  it('draws one arc per slice and labels only the slices above the minimum share', () => {
    const { container } = renderDonut()
    expect(container.querySelectorAll('[data-role="slice"]')).toHaveLength(4)
    const labels = [...container.querySelectorAll('[data-role="slice-label"]')].map((l) => l.textContent)
    expect(labels).toEqual(['45,3\u00a0%Bonos', '40,1\u00a0%CEDEARs', '12,1\u00a0%Fondos (FCI)'])
  })

  it('puts the total and the return in the centre', () => {
    const { container } = renderDonut()
    expect(container.querySelector('[data-role="center"]')!.textContent).toBe('TOTAL$10,7M+4,20 %')
  })

  it('draws a single type as a full ring', () => {
    const { container } = renderDonut({
      slices: [{ key: 'BOND', label: 'Bonos', value: 900, pct: 100, color: 'var(--chart-5)' }],
    })
    const arcs = container.querySelectorAll('[data-role="slice"]')
    expect(arcs).toHaveLength(1)
    expect(arcs[0].getAttribute('d')).toMatch(/^M.+A.+Z$/)
    expect(container.querySelector('[data-role="slice-label"]')!.textContent).toBe('100,0\u00a0%Bonos')
  })

  it('skips zero slices and lists every drawn slice for screen readers', () => {
    const { container } = renderDonut({
      slices: [...slices, { key: 'OTHER', label: 'Otros', value: 0, pct: 0, color: 'var(--chart-3)' }],
    })
    expect(container.querySelectorAll('[data-role="slice"]')).toHaveLength(4)
    expect(container.querySelectorAll('.sr-only table tbody tr')).toHaveLength(4)
  })

  it('drops the slice labels when the ring is too small to hold them', () => {
    stubChartSize(100, 100)
    const { container } = renderDonut()
    expect(container.querySelectorAll('[data-role="slice"]')).toHaveLength(4)
    expect(container.querySelectorAll('[data-role="slice-label"]')).toHaveLength(0)
  })
})
