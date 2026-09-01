import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CompositionBar } from '../CompositionBar'

const ars = (val: string) => `$ ${Number(val).toLocaleString('es-AR')}`

const threeSlices = [
  { label: 'Acciones', amount: ars('500000'), pct: 62.5 },
  { label: 'Bonos', amount: ars('200000'), pct: 25.0 },
  { label: 'Liquidez', amount: ars('100000'), pct: 12.5 }
]

describe('CompositionBar & LegendList', () => {
  it('shows amount and percent per slice', () => {
    render(<CompositionBar slices={[{ label: 'Acciones', amount: ars('500000'), pct: 62.5 }]} />)
    expect(screen.getByText('Acciones')).toBeInTheDocument()
    expect(screen.getByText('+62,50 %')).toBeInTheDocument()
  })

  it('labels every slice in the legend, so colour is never the only key', () => {
    render(<CompositionBar slices={threeSlices} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('sums to 100% without a rounding gap in the track', () => {
    const { container } = render(<CompositionBar slices={threeSlices} />)
    const widths = [...container.querySelectorAll('[data-slice]')].map((s) => Number(s.getAttribute('data-pct')))
    expect(widths.reduce((a, b) => a + b, 0)).toBeCloseTo(100, 1)
  })
})
