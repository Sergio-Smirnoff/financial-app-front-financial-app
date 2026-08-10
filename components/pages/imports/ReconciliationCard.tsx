'use client'

import React from 'react'
import { StatusDot } from '@/components/ui-kit/row/StatusDot'
import { formatCurrency } from '@/lib/format'

export interface ReconciliationCardProps {
  matched?: boolean
  difference?: number
  hasBalanceColumn?: boolean
}

export function ReconciliationCard({
  matched = true,
  difference = 0,
  hasBalanceColumn = true,
}: ReconciliationCardProps) {
  if (!hasBalanceColumn) {
    return (
      <div className="elev-sm rounded-xl border bg-card p-5 space-y-2">
        <h3 className="section-head">Verificación de Conciliación</h3>
        <p className="text-sm text-muted-foreground">Sin saldo para verificar</p>
      </div>
    )
  }

  return (
    <div className="elev-sm rounded-xl border bg-card p-5 space-y-3">
      <h3 className="section-head">Verificación de Conciliación</h3>
      <div className="flex items-center gap-3">
        <StatusDot
          tone={matched ? 'ok' : 'error'}
          label={matched ? 'Saldo coincide' : 'Diferencia de saldo'}
        />
        {!matched && difference !== 0 && (
          <span className="text-xs font-semibold text-destructive">
            Diferencia: {formatCurrency(difference, 'ARS')}
          </span>
        )}
      </div>
    </div>
  )
}
