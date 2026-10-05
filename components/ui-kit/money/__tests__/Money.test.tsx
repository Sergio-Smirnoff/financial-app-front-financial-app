import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Money, moneyText } from '../Money'

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

  it('renders an em-dash placeholder for an absent figure instead of throwing', () => {
    render(<Money value={null} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('prints the compact figure with the same sign rules when compact', () => {
    render(<Money value={{ amount: '88554220', currency: 'ARS', secondary: null }} tone="gain" compact />)
    expect(screen.getByText('+$88,6M')).toBeInTheDocument()
  })

  it('keeps one decimal below a thousand in a compact figure when asked for decimals', () => {
    expect(moneyText({ value: { amount: '0.4', currency: 'USD' }, compact: true, decimals: 1 })).toBe('US$0,4')
    expect(moneyText({ value: { amount: '0.4', currency: 'USD' }, compact: true })).toBe('US$0')
  })

  it('prints a whole figure with no decimals', () => {
    expect(moneyText({ value: { amount: '1500', currency: 'ARS' }, decimals: 0 })).toMatch(/^\$\s1\.500$/)
  })

  it('prints a dollar quote currency as US$ instead of throwing', () => {
    expect(moneyText({ value: { amount: '10', currency: 'USD_MEP' } })).toMatch(/^US\$\s10,00$/)
  })
})
