import * as React from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// KpiTile
// ---------------------------------------------------------------------------

export interface KpiTileProps {
  label: string
  value: React.ReactNode
  delta?: React.ReactNode
  hint?: string
  className?: string
}

export function KpiTile({ label, value, delta, hint, className }: KpiTileProps) {
  return (
    <div
      className={cn('elev-sm flex flex-col gap-1 rounded-lg p-4 bg-card', className)}
      title={hint}
    >
      <span className="kicker">{label}</span>
      <div className="text-2xl font-semibold n">{value}</div>
      {delta !== undefined && (
        <div className="text-xs text-muted-foreground">{delta}</div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// KpiStrip
// ---------------------------------------------------------------------------

export interface KpiStripProps {
  children: React.ReactNode
  className?: string
}

export function KpiStrip({ children, className }: KpiStripProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-4', className)}>{children}</div>
  )
}

// ---------------------------------------------------------------------------
// RailSection
// ---------------------------------------------------------------------------

export interface RailSectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function RailSection({ title, children, className }: RailSectionProps) {
  return (
    <section className={cn('', className)}>
      <h3 className="section-head">{title}</h3>
      <div className="fade-rule mb-3" />
      {children}
    </section>
  )
}

// ---------------------------------------------------------------------------
// SplitLayout
// ---------------------------------------------------------------------------

export interface SplitLayoutProps {
  main: React.ReactNode
  rail: React.ReactNode
  className?: string
}

/**
 * `rail` comes after `main` in DOM order (tab order follows content),
 * but is placed visually to the right via CSS order.
 */
export function SplitLayout({ main, rail, className }: SplitLayoutProps) {
  return (
    <div className={cn('flex gap-6', className)}>
      <div className="flex-1 min-w-0">{main}</div>
      <aside className="w-80 shrink-0 space-y-4">{rail}</aside>
    </div>
  )
}
