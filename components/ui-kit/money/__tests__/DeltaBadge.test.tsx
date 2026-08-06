import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DeltaBadge } from '../DeltaBadge'

describe('DeltaBadge', () => {
  it('renders percentage with direction glyph', () => {
    render(<DeltaBadge pct={5.2} />)
    expect(screen.getAllByText(/↑|\+|▲/).length).toBeGreaterThan(0)
    expect(screen.getByText(/5,20/)).toBeInTheDocument()
  })

  it('renders negative percentage with loss glyph', () => {
    render(<DeltaBadge pct={-3.1} />)
    expect(screen.getAllByText(/↓|−|▼/).length).toBeGreaterThan(0)
    expect(screen.getByText(/3,10/)).toBeInTheDocument()
  })

  it('renders optional absolute money value when provided', () => {
    render(
      <DeltaBadge
        pct={10}
        absolute={{ amount: '500', currency: 'USD', secondary: null }}
      />
    )
    expect(screen.getByText(/500,00/)).toBeInTheDocument()
  })
})
