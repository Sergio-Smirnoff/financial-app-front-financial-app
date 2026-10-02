'use client'

import { useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { FRAME_QUERY } from '@/lib/layout/frame'

export const UNFRAMED_LIST_LIMIT = 6

export interface FitCount<T extends HTMLElement> {
  ref: RefObject<T | null>
  count: number
  framed: boolean
}

interface Fit {
  count: number
  framed: boolean
}

function isFramed(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(FRAME_QUERY).matches
}

function rowsThatFit(list: HTMLElement): number {
  const rows = Array.from(list.children) as HTMLElement[]
  const wasHidden = rows.map((row) => row.hidden)
  rows.forEach((row) => {
    row.hidden = false
  })
  const limit = list.clientHeight + 0.5
  let fits = 0
  for (const row of rows) {
    if (row.offsetTop + row.offsetHeight > limit) break
    fits += 1
  }
  rows.forEach((row, index) => {
    row.hidden = wasHidden[index]
  })
  return fits
}

export function useFitCount<T extends HTMLElement>(total: number): FitCount<T> {
  const ref = useRef<T>(null)
  const [fit, setFit] = useState<Fit>({ count: Math.min(total, UNFRAMED_LIST_LIMIT), framed: false })

  useLayoutEffect(() => {
    const list = ref.current
    if (!list) return
    const measure = () => {
      const framed = isFramed()
      const count = framed ? rowsThatFit(list) : Math.min(total, UNFRAMED_LIST_LIMIT)
      setFit((prev) => (prev.count === count && prev.framed === framed ? prev : { count, framed }))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    return () => observer.disconnect()
  }, [total])

  return { ref, ...fit }
}
