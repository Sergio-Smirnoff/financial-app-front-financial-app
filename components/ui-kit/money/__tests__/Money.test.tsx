import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Money } from '../Money'

describe('Money', () => {
  it('renders primary and secondary figures', () => {
    render(
      <Money
        value={{
          amount: '1000',
          currency: 'USD',
          secondary: { amount: '1190000', currency: 'ARS', secondary: null },
        }}
      />
    )
    expect(screen.getByText(/1\.000,00/)).toBeInTheDocument()
    expect(screen.getByText(/1\.190\.000,00/)).toBeInTheDocument()
  })

  it('signs the figure with a glyph, not colour alone', () => {
    render(<Money value={{ amount: '-500', currency: 'ARS', secondary: null }} tone="loss" />)
    expect(screen.getByText(/^−/)).toBeInTheDocument()
  })

  it('uses tabular numerals', () => {
    const { container } = render(<Money value={{ amount: '1', currency: 'ARS', secondary: null }} />)
    expect(container.firstChild).toHaveClass('n')
  })
})
