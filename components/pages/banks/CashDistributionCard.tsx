'use client'

import React from 'react'
import { CompositionBar } from '@/components/charts/CompositionBar'
import { formatMoney } from '@/lib/format'
import type { BankAccountRow } from '@/lib/api/bff/types'

export interface CashDistributionCardProps {
  accounts: BankAccountRow[]
}

export function CashDistributionCard({ accounts }: CashDistributionCardProps) {
  const total = accounts.reduce((acc, a) => acc + Math.max(0, parseFloat(a.balance.amount || '0')), 0) || 1

  const slices = accounts.map((a) => {
    const val = Math.max(0, parseFloat(a.balance.amount || '0'))
    return {
      label: `${a.bankName} (${a.alias || a.accountType})`,
      amount: formatMoney(a.balance),
      pct: (val / total) * 100,
    }
  }).filter((s) => s.pct > 0)

  return (
    <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
      <h3 className="section-head">Distribución de Saldos</h3>
      {slices.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin saldos registrados.</p>
      ) : (
        <CompositionBar slices={slices} />
      )}
    </div>
  )
}
