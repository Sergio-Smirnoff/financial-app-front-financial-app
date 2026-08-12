'use client'

import React from 'react'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { Money } from '@/components/ui-kit/money/Money'
import { cn } from '@/lib/utils'
import type { components } from '@/lib/api/bff/schema'

export type ReconciliationRowResponse = components['schemas']['ReconciliationRowResponse']

export interface ReconciliationCardProps {
  rows?: ReconciliationRowResponse[]
}

export function ReconciliationCard({ rows = [] }: ReconciliationCardProps) {
  return (
    <div data-testid="reconciliation-card" className="elev-sm rounded-xl border bg-card p-5 space-y-4">
      <h3 className="section-head">Verificación de Conciliación</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin conciliación registrada</p>
      ) : (
        <div className="space-y-4">
          {rows.map((row, index) => {
            const matched = row.matches ?? false
            return (
              <div key={row.runId ?? index} className="space-y-2 border-b last:border-b-0 pb-3 last:pb-0">
                <div className="flex items-center gap-2">
                  {matched ? (
                    <CheckCircle2 className="h-4 w-4 text-gain shrink-0" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" aria-hidden="true" />
                  )}
                  <span className={cn('text-sm font-medium', matched ? 'text-gain' : 'text-destructive')}>
                    {matched ? 'Saldo coincide' : 'Saldo no coincide'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span>Esperado: </span>
                    {row.expectedBalance ? <Money value={row.expectedBalance} /> : '—'}
                  </div>
                  <div>
                    <span>Calculado: </span>
                    {row.computedBalance ? <Money value={row.computedBalance} /> : '—'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
