import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { KpiTile, KpiStrip, SplitLayout } from '../KpiStrip'

describe('KpiTile', () => {
  it('renders label and value', () => {
    render(<KpiTile label="Saldo" value="$1.000" />)
    expect(screen.getByText('Saldo')).toBeInTheDocument()
    expect(screen.getByText('$1.000')).toBeInTheDocument()
  })

  it('renders delta when provided', () => {
    render(<KpiTile label="Saldo" value="$1.000" delta="+5%" />)
    expect(screen.getByText('+5%')).toBeInTheDocument()
  })

  it('does not render a delta element when absent', () => {
    render(<KpiTile label="Saldo" value="$1.000" />)
    expect(screen.queryByText(/\+|\−/)).not.toBeInTheDocument()
  })

  it('uses kicker class on the label', () => {
    render(<KpiTile label="Saldo" value="$1.000" />)
    expect(screen.getByText('Saldo')).toHaveClass('kicker')
  })

  it('uses n class on the value wrapper for tabular numerals', () => {
    const { container } = render(<KpiTile label="Saldo" value="$1.000" />)
    // The value div is the sibling of the kicker span
    const valueEl = container.querySelector('.n')
    expect(valueEl).not.toBeNull()
    expect(valueEl).toHaveTextContent('$1.000')
  })
})

describe('SplitLayout', () => {
  it('renders rail after main in the DOM so tab order follows content', () => {
    const { container } = render(
      <SplitLayout main={<button>Main action</button>} rail={<button>Rail action</button>} />
    )
    const buttons = container.querySelectorAll('button')
    expect(buttons[0]).toHaveTextContent('Main action')
    expect(buttons[1]).toHaveTextContent('Rail action')
  })
})
