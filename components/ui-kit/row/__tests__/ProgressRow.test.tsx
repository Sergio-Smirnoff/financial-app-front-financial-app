import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressRow } from '../ProgressRow'
import { StatusDot } from '../StatusDot'

describe('ProgressRow', () => {
  it('renders label and value', () => {
    render(<ProgressRow label="Comida" value={80} max={100} />)
    expect(screen.getByText('Comida')).toBeInTheDocument()
  })

  it('turns the track red past 100%', () => {
    const { container } = render(<ProgressRow label="Comida" value={120} max={100} />)
    expect(container.querySelector('[data-over="true"]')).toBeInTheDocument()
  })

  it('clamps visual track to 100%', () => {
    const { container } = render(<ProgressRow label="Comida" value={150} max={100} />)
    const track = container.querySelector('[data-over="true"] > div')
    // The fill div should have width capped at 100%
    expect(track).toBeInTheDocument()
  })

  it('renders figures with .n class', () => {
    const { container } = render(<ProgressRow label="Comida" value={80} max={100} />)
    const nums = container.querySelectorAll('.n')
    expect(nums.length).toBeGreaterThan(0)
  })

  it('shows amount and share with no cap', () => {
    const { container } = render(<ProgressRow label="Comida" share={36.9} valueText="$ 85.000" />)
    expect(screen.getByText('$ 85.000 · 36,9 %')).toBeInTheDocument()
    expect(container).not.toHaveTextContent('/')
    expect(container.querySelector('[data-over]')).not.toBeInTheDocument()
    expect(container.querySelector('.bg-primary')).toHaveStyle({ width: '36.9%' })
  })

  it('never marks a share as over budget, even past 100', () => {
    const { container } = render(<ProgressRow label="Comida" share={120} valueText="$ 1" />)
    expect(container.querySelector('[data-over]')).not.toBeInTheDocument()
    expect(container.querySelector('.bg-primary')).toHaveStyle({ width: '100%' })
  })

  it('keeps the capped figure for budgets', () => {
    render(<ProgressRow label="Comida" value={80} max={100} caption="80 %" />)
    expect(screen.getByText('80 / 100')).toBeInTheDocument()
    expect(screen.getByText('80 %')).toBeInTheDocument()
  })
})

describe('StatusDot', () => {
  it('never signals with colour alone', () => {
    render(<StatusDot tone="warn" label="Desactualizado" />)
    expect(screen.getByText('Desactualizado')).toBeInTheDocument()
  })

  it('renders the status-dot class', () => {
    const { container } = render(<StatusDot tone="ok" label="Activo" />)
    expect(container.querySelector('.status-dot')).toBeInTheDocument()
  })

  it('applies tone modifier class', () => {
    const { container } = render(<StatusDot tone="error" label="Error" />)
    expect(container.querySelector('.status-dot--error')).toBeInTheDocument()
  })
})
