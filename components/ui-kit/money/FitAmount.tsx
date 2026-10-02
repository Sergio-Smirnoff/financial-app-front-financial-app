'use client'

import React, { createContext, useCallback, useContext, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Money, moneyText, type MoneyProps } from './Money'

export const FIT_AMOUNT_FLOOR_PX = 12

export type FitAmountProps = MoneyProps

interface FitGroup {
  fontPx: number | null
  report: (id: string, fontPx: number | null) => void
}

const FitGroupContext = createContext<FitGroup | null>(null)

export function FitAmountGroup({ children }: { children: React.ReactNode }) {
  const [sizes, setSizes] = useState<ReadonlyMap<string, number | null>>(new Map())
  const report = useCallback((id: string, fontPx: number | null) => {
    setSizes((prev) => (prev.has(id) && prev.get(id) === fontPx ? prev : new Map(prev).set(id, fontPx)))
  }, [])
  const fontPx = useMemo(() => {
    const fitted = [...sizes.values()].filter((px): px is number => px != null)
    return fitted.length > 0 ? Math.min(...fitted) : null
  }, [sizes])
  const group = useMemo(() => ({ fontPx, report }), [fontPx, report])
  return <FitGroupContext.Provider value={group}>{children}</FitGroupContext.Provider>
}

function fittedFontPx(root: HTMLElement, probe: HTMLElement, scale: number): number | null {
  const natural = probe.scrollWidth
  const available = root.clientWidth
  if (natural === 0 || available === 0) return null
  const ratio = Math.min(1, available / natural) * scale
  if (ratio >= 1) return null
  const base = parseFloat(window.getComputedStyle(root).fontSize)
  return Math.floor(2 * base * ratio) / 2
}

export function FitAmount({ className, ...money }: FitAmountProps) {
  const id = useId()
  const group = useContext(FitGroupContext)
  const report = group?.report
  const rootRef = useRef<HTMLSpanElement>(null)
  const probeRef = useRef<HTMLSpanElement>(null)
  const amountRef = useRef<HTMLSpanElement>(null)
  const scaleRef = useRef(1)
  const widthRef = useRef(0)
  const [own, setOwn] = useState<number | null>(null)

  const measure = useCallback(() => {
    const root = rootRef.current
    const probe = probeRef.current
    if (!root || !probe) return
    const amount = amountRef.current
    if (amount && root.clientWidth > 0 && amount.scrollWidth > root.clientWidth) {
      scaleRef.current *= root.clientWidth / amount.scrollWidth
    }
    const next = fittedFontPx(root, probe, scaleRef.current)
    setOwn((prev) => (prev === next ? prev : next))
  }, [])

  const remeasure = useCallback(
    (force: boolean) => {
      const width = rootRef.current?.clientWidth ?? 0
      if (force || width !== widthRef.current) {
        widthRef.current = width
        scaleRef.current = 1
      }
      measure()
    },
    [measure],
  )

  useLayoutEffect(() => {
    measure()
  })

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    let active = true
    const observer = new ResizeObserver(() => remeasure(false))
    observer.observe(root)
    void document.fonts?.ready.then(() => {
      if (active) remeasure(true)
    })
    return () => {
      active = false
      observer.disconnect()
    }
  }, [remeasure])

  useLayoutEffect(() => {
    report?.(id, own)
  }, [report, id, own])

  useLayoutEffect(() => () => report?.(id, null), [report, id])

  const applied = group ? group.fontPx : own
  const compact = own != null && own < FIT_AMOUNT_FLOOR_PX
  const fontPx = applied == null ? null : Math.max(applied, FIT_AMOUNT_FLOOR_PX)
  const full = moneyText(money)

  return (
    <span
      ref={rootRef}
      data-amount-root
      title={compact ? full : undefined}
      className={cn('relative block min-w-0 overflow-hidden', className)}
    >
      <span
        ref={amountRef}
        data-amount
        data-fit={compact ? 'compact' : fontPx != null ? 'shrunk' : 'full'}
        className="block whitespace-nowrap"
        style={fontPx != null ? { fontSize: `${fontPx}px` } : undefined}
      >
        {compact ? (
          <>
            <span aria-hidden="true">
              <Money {...money} compact />
            </span>
            <span className="sr-only">{full}</span>
          </>
        ) : (
          <Money {...money} />
        )}
      </span>
      <span
        ref={probeRef}
        data-amount-probe
        data-text={full}
        aria-hidden="true"
        className="pointer-events-none invisible absolute top-0 left-0 whitespace-nowrap after:content-[attr(data-text)]"
      />
    </span>
  )
}
