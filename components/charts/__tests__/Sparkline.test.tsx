import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Sparkline } from '../Sparkline'

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

describe('Sparkline', () => {
  it('renders no axes and no labels', () => {
    render(<Sparkline series={series12} ariaLabel="Tendencia Comida" />)
    expect(screen.queryAllByTestId('tick-x')).toHaveLength(0)
    expect(screen.getByRole('img', { name: 'Tendencia Comida' })).toBeInTheDocument()
  })
})
