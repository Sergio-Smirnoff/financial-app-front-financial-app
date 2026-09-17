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
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  paddingBottom?: number
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
  paddingLeft,
  paddingRight,
  paddingTop,
  paddingBottom,
  yMin0 = false
}: UseChartScalesOptions): UseChartScalesResult {
  return useMemo(() => {
    const pl = paddingLeft ?? paddingX ?? padding
    const pr = paddingRight ?? paddingX ?? padding
    const pt = paddingTop ?? paddingY ?? padding
    const pb = paddingBottom ?? paddingY ?? padding

    if (points.length === 0) {
      const now = new Date()
      const x = scaleUtc().domain([now, now]).range([pl, width - pr])
      const y = scaleLinear().domain([0, 100]).range([height - pb, pt]).nice()
      return { x, y, ticksX: x.ticks(5), ticksY: y.ticks(5) }
    }

    const dates = points.map((p) => (p.date instanceof Date ? p.date : new Date(p.date)))
    const timeValues = dates.map((d) => d.getTime()).filter((t) => !isNaN(t))
    let minTime = timeValues.length > 0 ? Math.min(...timeValues) : Date.now()
    let maxTime = timeValues.length > 0 ? Math.max(...timeValues) : Date.now()

    if (minTime === maxTime) {
      // Avoid singular domain when there is only one timestamp or single point
      minTime -= 86_400_000 // 1 day before
      maxTime += 86_400_000 // 1 day after
    }

    const minDate = new Date(minTime)
    const maxDate = new Date(maxTime)

    const values = points.map((p) => p.value).filter((v) => !isNaN(v))
    const minVal = yMin0 ? 0 : (values.length > 0 ? Math.min(...values) : 0)
    const maxVal = values.length > 0 ? Math.max(...values) : 100

    // If min and max are equal, provide padding around the value
    const finalMin = minVal === maxVal ? (yMin0 ? 0 : minVal - 1) : minVal
    const finalMax = minVal === maxVal ? maxVal + 1 : maxVal

    const x = scaleUtc()
      .domain([minDate, maxDate])
      .range([pl, width - pr])

    const y = scaleLinear()
      .domain([finalMin, finalMax])
      .range([height - pb, pt])
      .nice()

    return {
      x,
      y,
      ticksX: x.ticks(5),
      ticksY: y.ticks(5)
    }
  }, [points, width, height, padding, paddingX, paddingY, paddingLeft, paddingRight, paddingTop, paddingBottom, yMin0])
}
