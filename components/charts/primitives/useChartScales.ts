import { useMemo } from 'react'
import { scaleUtc, scaleLinear, ScaleTime, ScaleLinear } from 'd3-scale'

export interface SeriesPoint {
  date: string | Date
  value: number
  label?: string
}

export interface UseChartScalesOptions {
  points: SeriesPoint[]
  width: number
  height: number
  padding?: number
  paddingX?: number
  paddingY?: number
  yMin0?: boolean
}

export interface UseChartScalesResult {
  x: ScaleTime<number, number>
  y: ScaleLinear<number, number>
  ticksX: Date[]
  ticksY: number[]
}

export function useChartScales({
  points,
  width,
  height,
  padding = 32,
  paddingX,
  paddingY,
  yMin0 = false
}: UseChartScalesOptions): UseChartScalesResult {
  return useMemo(() => {
    const px = paddingX ?? padding
    const py = paddingY ?? padding

    if (points.length === 0) {
      const now = new Date()
      const x = scaleUtc().domain([now, now]).range([px, width - px])
      const y = scaleLinear().domain([0, 100]).range([height - py, py]).nice()
      return { x, y, ticksX: x.ticks(5), ticksY: y.ticks(5) }
    }

    const dates = points.map((p) => (p.date instanceof Date ? p.date : new Date(p.date)))
    const minDate = dates[0]
    const maxDate = dates[dates.length - 1]

    const values = points.map((p) => p.value)
    const minVal = yMin0 ? 0 : Math.min(...values)
    const maxVal = Math.max(...values)
    // If min and max are equal, provide padding around the value
    const finalMin = minVal === maxVal ? (yMin0 ? 0 : minVal - 1) : minVal
    const finalMax = minVal === maxVal ? maxVal + 1 : maxVal

    const x = scaleUtc()
      .domain([minDate, maxDate])
      .range([px, width - px])

    const y = scaleLinear()
      .domain([finalMin, finalMax])
      .range([height - py, py])
      .nice()

    return {
      x,
      y,
      ticksX: x.ticks(5),
      ticksY: y.ticks(5)
    }
  }, [points, width, height, padding, paddingX, paddingY, yMin0])
}
