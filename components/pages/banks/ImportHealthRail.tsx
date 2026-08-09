'use client'

import React from 'react'
import Link from 'next/link'
import { StatusDot } from '@/components/ui-kit/row/StatusDot'
import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'

export interface ImportHealthItem {
  id: string
  accountName: string
  status: 'FRESH' | 'STALE' | 'NEVER'
  lastImportAt: string | null
}

export interface ImportHealthRailProps {
  items: ImportHealthItem[]
}

export function ImportHealthRail({ items }: ImportHealthRailProps) {
  return (
    <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="section-head">Estado de Importaciones</h3>
        <Link href="/imports" className="text-xs text-primary hover:underline font-medium">
          Importar →
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Sin importaciones</p>
          <Link href="/imports" className="text-xs text-primary underline">
            Ir a Importaciones
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isNever = item.status === 'NEVER' || !item.lastImportAt
            const isStale = item.status === 'STALE'

            return (
              <div key={item.id} data-row className="flex items-center justify-between gap-3 text-sm py-1 border-b last:border-b-0">
                <div className="flex items-center gap-2 min-w-0">
                  <StatusDot
                    tone={isNever ? 'neutral' : isStale ? 'warn' : 'ok'}
                    label={isNever ? 'Sin importaciones' : isStale ? 'Desactualizado' : 'Al día'}
                  />
                  <span className="truncate font-medium">{item.accountName}</span>
                </div>
                {item.lastImportAt ? (
                  <FreshnessStamp observedAt={item.lastImportAt} />
                ) : (
                  <Link href="/imports" className="text-xs text-muted-foreground hover:underline">
                    Importar
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
