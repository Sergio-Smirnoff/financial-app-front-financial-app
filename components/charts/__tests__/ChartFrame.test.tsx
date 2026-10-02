import React from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { ChartFrame } from '../primitives/ChartFrame'
import { stubChartSize } from '@/test/chartSize'

const sizeProbe = (size: { width: number; height: number }) => (
  <text data-testid="size">{`${size.width}x${size.height}`}</text>
)

describe('ChartFrame', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('draws the svg at the measured pixel size, without viewBox stretching', () => {
    stubChartSize(480, 220)
    render(<ChartFrame ariaLabel="Flujo">{sizeProbe}</ChartFrame>)
    const svg = screen.getByRole('img', { name: 'Flujo' })
    expect(svg).toHaveAttribute('width', '480')
    expect(svg).toHaveAttribute('height', '220')
    expect(svg).toHaveAttribute('viewBox', '0 0 480 220')
    expect(svg).not.toHaveAttribute('preserveAspectRatio')
    expect(screen.getByTestId('size')).toHaveTextContent('480x220')
  })

  it('draws nothing until the container has been measured', () => {
    render(<ChartFrame ariaLabel="Flujo">{sizeProbe}</ChartFrame>)
    expect(screen.getByRole('img', { name: 'Flujo' })).toBeInTheDocument()
    expect(screen.queryByTestId('size')).not.toBeInTheDocument()
  })

  it('keeps its minHeight when the container has no height', () => {
    stubChartSize(400, 0)
    const { container } = render(<ChartFrame ariaLabel="Flujo">{sizeProbe}</ChartFrame>)
    expect(container.querySelector('[data-chart-frame]')).toHaveStyle({ minHeight: '160px' })
    const svgHeight = Number(screen.getByRole('img', { name: 'Flujo' }).getAttribute('height'))
    expect(svgHeight).toBeGreaterThanOrEqual(160)
    expect(screen.getByTestId('size')).toHaveTextContent('400x160')
  })

  it('honours a caller minHeight', () => {
    stubChartSize(400, 0)
    const { container } = render(
      <ChartFrame ariaLabel="Flujo" minHeight={96}>
        {sizeProbe}
      </ChartFrame>
    )
    expect(container.querySelector('[data-chart-frame]')).toHaveStyle({ minHeight: '96px' })
    expect(screen.getByTestId('size')).toHaveTextContent('400x96')
  })

  it('stops observing when it unmounts', () => {
    const disconnect = vi.fn()
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect = disconnect
      }
    )
    const { unmount } = render(<ChartFrame ariaLabel="Flujo">{sizeProbe}</ChartFrame>)
    unmount()
    expect(disconnect).toHaveBeenCalledTimes(1)
  })
})
