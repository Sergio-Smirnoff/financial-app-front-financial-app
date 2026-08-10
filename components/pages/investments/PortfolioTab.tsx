'use client'

import React from 'react'
import Link from 'next/link'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { DataTable } from '@/components/ui-kit/table/DataTable'
import { Money } from '@/components/ui-kit/money/Money'
import { DeltaBadge } from '@/components/ui-kit/money/DeltaBadge'
import { CompositionBar } from '@/components/charts/CompositionBar'
import { LegendList } from '@/components/charts/LegendList'
import { formatMoney } from '@/lib/format'
import type { Section, InvestmentHoldingRow } from '@/lib/api/bff/types'
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'

export interface PortfolioTabProps {
  holdingsSection?: Section<InvestmentHoldingRow[]>
  allocationSection?: Section<{ assetType: string; amount: any; pct: number }[]>
  isLoading: boolean
  onRetry?: () => void
}

const columns: ColumnDef<InvestmentHoldingRow, unknown>[] = [
  {
    id: 'ticker',
    accessorKey: 'ticker',
    header: 'Ticker',
    cell: ({ row }) => (
      <Link href={`/investments/holdings/${row.original.id}`} className="font-mono font-semibold text-primary hover:underline">
        {row.original.ticker}
      </Link>
    ),
  },
  {
    id: 'assetType',
    accessorKey: 'assetType',
    header: 'Tipo',
  },
  {
    id: 'quantity',
    accessorKey: 'quantity',
    header: 'Cantidad',
  },
  {
    id: 'totalValue',
    accessorFn: (row) => row,
    header: 'Valor Total',
    cell: ({ getValue }) => <Money value={(getValue() as InvestmentHoldingRow).totalValue} />,
  },
  {
    id: 'pnl',
    accessorFn: (row) => row,
    header: 'Resultado (P&L)',
    cell: ({ getValue }) => {
      const row = getValue() as InvestmentHoldingRow
      return <DeltaBadge pct={row.pnl.pct} absolute={row.pnl.amount} />
    },
  },
]

export function PortfolioTab({
  holdingsSection,
  allocationSection,
  isLoading,
  onRetry,
}: PortfolioTabProps) {
  const slices = allocationSection?.data?.map((a) => ({
    label: a.assetType,
    amount: formatMoney(a.amount),
    pct: a.pct,
  })) ?? []

  return (
    <div className="space-y-6">
      <SectionState
        section={holdingsSection}
        isLoading={isLoading}
        onRetry={onRetry}
        skeleton={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
      >
        {(holdings) => (
          <div className="space-y-4">
            <h3 className="section-head">Posiciones en Cartera</h3>
            <DataTable columns={columns} rows={holdings} caption="Posiciones de inversión" />
          </div>
        )}
      </SectionState>

      {slices.length > 0 && (
        <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
          <h3 className="section-head">Distribución por Tipo de Activo</h3>
          <CompositionBar slices={slices} />
          <LegendList items={slices.map((s) => ({ label: s.label, value: s.amount, color: 'hsl(var(--primary))' }))} />
        </div>
      )}
    </div>
  )
}
