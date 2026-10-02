export function plotRange(start: number, end: number): [number, number] {
  return [start, Math.max(start, end)]
}

export function plotRangeDown(top: number, bottom: number): [number, number] {
  return [Math.max(top, bottom), top]
}
