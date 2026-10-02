import React from 'react'
import { render, renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { scaleLinear, scaleUtc } from 'd3-scale'
import { useChartScales } from '../primitives/useChartScales'
import { Axis } from '../primitives/Axis'

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

describe('useChartScales', () => {
  it('generates ticks that fall inside the domain', () => {
    const { result } = renderHook(() =>
      useChartScales({ points: series12, width: 640, height: 240, padding: 32 })
    )
    const [min, max] = result.current.y.domain()
    expect(result.current.ticksY.every((t) => t >= min && t <= max)).toBe(true)
  })

  it('maps the last point to the right edge minus padding', () => {
    const { result } = renderHook(() =>
      useChartScales({ points: series12, width: 640, height: 240, padding: 32 })
    )
    expect(result.current.x(new Date(series12.at(-1)!.date))).toBeCloseTo(608, 0)
  })
})

describe('Axis', () => {
  it('labels large ticks with the shared compact formatter by default', () => {
    const yScale = scaleLinear().domain([0, 8e7]).range([200, 32])
    const xScale = scaleUtc().domain([new Date('2026-01-01'), new Date('2026-02-01')]).range([56, 600])
    const { container } = render(
      <svg>
        <Axis xScale={xScale} yScale={yScale} ticksX={[]} ticksY={[1.5e3, 8e7]} width={640} height={240} />
      </svg>
    )
    const labels = [...container.querySelectorAll('[data-testid="tick-y"] text')].map((t) => t.textContent)
    expect(labels).toEqual(['1,5k', '80M'])
  })

  it('keeps one decimal on small ticks by default instead of rounding them to zero', () => {
    const yScale = scaleLinear().domain([0, 1]).range([200, 32])
    const xScale = scaleUtc().domain([new Date('2026-01-01'), new Date('2026-02-01')]).range([56, 600])
    const { container } = render(
      <svg>
        <Axis xScale={xScale} yScale={yScale} ticksX={[]} ticksY={[0, 0.25, 0.5]} width={640} height={240} />
      </svg>
    )
    const labels = [...container.querySelectorAll('[data-testid="tick-y"] text')].map((t) => t.textContent)
    expect(labels).toEqual(['0', '0,3', '0,5'])
  })
})
