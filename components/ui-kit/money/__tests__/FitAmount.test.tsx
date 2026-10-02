import React from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FitAmount, FitAmountGroup } from '../FitAmount'

const ars = (amount: string) => ({ amount, currency: 'ARS', secondary: null })
let boxWidth = 300

const amounts = () => [...document.querySelectorAll<HTMLElement>('[data-amount]')]

describe('FitAmount', () => {
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(function (this: Element) {
      return this.hasAttribute('data-amount-root') ? boxWidth : 0
    })
    vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockImplementation(function (this: Element) {
      return this.hasAttribute('data-amount-probe') ? (this.getAttribute('data-text') ?? '').length * 10 : 0
    })
    vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({ fontSize: '24px' }) as CSSStyleDeclaration)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('keeps the inherited size when the amount fits', () => {
    boxWidth = 300
    render(<FitAmount value={ars('88554220')} tone="gain" />)
    const [amount] = amounts()
    expect(amount).toHaveAttribute('data-fit', 'full')
    expect(amount.style.fontSize).toBe('')
    expect(amount).toHaveClass('whitespace-nowrap')
  })

  it('steps the font down until the amount fits on one line', () => {
    boxWidth = 120
    render(<FitAmount value={ars('88554220')} tone="gain" />)
    const [amount] = amounts()
    expect(amount).toHaveAttribute('data-fit', 'shrunk')
    expect(amount.style.fontSize).toBe('18px')
  })

  it('shows the compact figure below the 12px floor, with the full one in the title and for screen readers', () => {
    boxWidth = 70
    render(<FitAmount value={ars('88554220')} tone="gain" />)
    const [amount] = amounts()
    expect(amount).toHaveAttribute('data-fit', 'compact')
    expect(amount.style.fontSize).toBe('12px')
    expect(screen.getByText('+$88,6M').closest('[aria-hidden="true"]')).not.toBeNull()
    expect(amount.closest('[data-amount-root]')).toHaveAttribute('title', expect.stringMatching(/^\+\$\s?88\.554\.220,00$/))
    expect(amount.querySelector('.sr-only')).toHaveTextContent(/88\.554\.220,00/)
  })

  it('gives every amount in a row the smallest fitted size', () => {
    boxWidth = 150
    render(
      <FitAmountGroup>
        <FitAmount value={ars('1000')} />
        <FitAmount value={ars('88554220')} tone="gain" />
      </FitAmountGroup>,
    )
    expect(amounts().map((a) => a.style.fontSize)).toEqual(['22.5px', '22.5px'])
  })

  it('renders the amount text once', () => {
    boxWidth = 300
    render(<FitAmount value={ars('1000')} />)
    expect(screen.getAllByText(/1\.000,00/)).toHaveLength(1)
  })
})
