import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useChartScales } from '../primitives/useChartScales'

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
