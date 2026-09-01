'use client'

import React from 'react'
import { AreaChart } from '@/components/charts/AreaChart'
import { BarPairChart } from '@/components/charts/BarPairChart'
import { HorizonBars } from '@/components/charts/HorizonBars'
import { CompositionBar } from '@/components/charts/CompositionBar'
import { Sparkline } from '@/components/charts/Sparkline'

const fixtureSeries = [
  { date: '2026-01-01', value: 100000 },
  { date: '2026-02-01', value: 120000 },
  { date: '2026-03-01', value: 115000 },
  { date: '2026-04-01', value: 140000 },
  { date: '2026-05-01', value: 155000 },
  { date: '2026-06-01', value: 150000 },
  { date: '2026-07-01', value: 175000 },
  { date: '2026-08-01', value: 190000 },
  { date: '2026-09-01', value: 185000 },
  { date: '2026-10-01', value: 210000 },
  { date: '2026-11-01', value: 225000 },
  { date: '2026-12-01', value: 250000 }
]

const fixtureCost = fixtureSeries.map((p) => ({ ...p, value: p.value * 0.85 }))

const fixtureMonths = [
  { month: '2026-01', income: 450000, expense: 320000 },
  { month: '2026-02', income: 480000, expense: 310000 },
  { month: '2026-03', income: 460000, expense: 350000 },
  { month: '2026-04', income: 510000, expense: 340000 },
  { month: '2026-05', income: 530000, expense: 380000 },
  { month: '2026-06', income: 550000, expense: 410000 },
  { month: '2026-07', income: 540000, expense: 390000 },
  { month: '2026-08', income: 590000, expense: 420000 },
  { month: '2026-09', income: 580000, expense: 400000 },
  { month: '2026-10', income: 610000, expense: 430000 },
  { month: '2026-11', income: 640000, expense: 450000 },
  { month: '2026-12', income: 680000, expense: 470000 }
]

const fixtureCommitted = [
  { month: '2026-01', amount: 350000 },
  { month: '2026-02', amount: 320000 },
  { month: '2026-03', amount: 290000 },
  { month: '2026-04', amount: 270000 },
  { month: '2026-05', amount: 240000 },
  { month: '2026-06', amount: 220000 },
  { month: '2026-07', amount: 190000 },
  { month: '2026-08', amount: 170000 },
  { month: '2026-09', amount: 140000 },
  { month: '2026-10', amount: 120000 },
  { month: '2026-11', amount: 90000 },
  { month: '2026-12', amount: 60000 }
]

const fixtureSlices = [
  { label: 'Acciones', amount: '$ 1.250.000', pct: 50.0 },
  { label: 'CEDEARs', amount: '$ 625.000', pct: 25.0 },
  { label: 'Bonos', amount: '$ 375.000', pct: 15.0 },
  { label: 'FCI Liquidez', amount: '$ 250.000', pct: 10.0 }
]

export default function ChartsDesignPreviewSection() {
  return (
    <section className="space-y-8 border-t border-border pt-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">SVG Charts Gallery (Plan 05)</h2>
        <p className="text-sm text-muted-foreground">
          Five owned SVG chart components with token styling, zero third-party chart dependencies, and zero layout shift.
        </p>
      </div>

      {/* 1. AreaChart */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">1. AreaChart (Net Worth / Portfolio Evolution)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border p-5 bg-card space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Live Chart (with comparison series)</span>
              <span>viewBox 640x240</span>
            </div>
            <AreaChart
              series={fixtureSeries}
              comparison={fixtureCost}
              currency="ARS"
              ariaLabel="Evolución de patrimonio neto"
            />
          </div>
          <div className="rounded-2xl border border-border p-5 bg-card space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Skeleton (Identical geometry)</span>
              <span>viewBox 640x240</span>
            </div>
            <div className="w-full aspect-[640/240] rounded-xl bg-muted/40 animate-pulse" />
          </div>
        </div>
      </div>

      {/* 2. BarPairChart */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">2. BarPairChart (12 Months Income vs Expenses)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border p-5 bg-card space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Live Chart (August highlighted)</span>
              <span>viewBox 640x240</span>
            </div>
            <BarPairChart
              months={fixtureMonths}
              highlightMonth="2026-08"
              currency="ARS"
              ariaLabel="Ingresos vs egresos por mes"
            />
          </div>
          <div className="rounded-2xl border border-border p-5 bg-card space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Skeleton</span>
              <span>viewBox 640x240</span>
            </div>
            <div className="w-full aspect-[640/240] rounded-xl bg-muted/40 animate-pulse" />
          </div>
        </div>
      </div>

      {/* 3. HorizonBars */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">3. HorizonBars (Committed Money Forward)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border p-5 bg-card space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Live Chart (Descending tone by rank)</span>
              <span>viewBox 640x240</span>
            </div>
            <HorizonBars
              months={fixtureCommitted}
              currency="ARS"
              ariaLabel="Dinero comprometido a futuro"
            />
          </div>
          <div className="rounded-2xl border border-border p-5 bg-card space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Skeleton</span>
              <span>viewBox 640x240</span>
            </div>
            <div className="w-full aspect-[640/240] rounded-xl bg-muted/40 animate-pulse" />
          </div>
        </div>
      </div>

      {/* 4. CompositionBar */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">4. CompositionBar & LegendList (Asset Allocation)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border p-5 bg-card space-y-2">
            <div className="text-xs text-muted-foreground mb-2">Live Stacked Track + Legend</div>
            <CompositionBar slices={fixtureSlices} />
          </div>
          <div className="rounded-2xl border border-border p-5 bg-card space-y-4">
            <div className="text-xs text-muted-foreground">Skeleton</div>
            <div className="h-3 w-full rounded-full bg-muted/40 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted/30 animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-muted/30 animate-pulse" />
              <div className="h-4 w-1/2 rounded bg-muted/30 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Sparkline */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">5. Sparkline (Inline Trend Indicator)</h3>
        <div className="flex items-center gap-6 rounded-2xl border border-border p-5 bg-card flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">Positivo:</span>
            <Sparkline series={fixtureSeries} ariaLabel="Tendencia positiva" width={120} height={36} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">Negativo:</span>
            <Sparkline
              series={[...fixtureSeries].reverse()}
              ariaLabel="Tendencia negativa"
              width={120}
              height={36}
              isPositive={false}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">Skeleton:</span>
            <div className="w-[120px] h-[36px] rounded bg-muted/40 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  )
}
