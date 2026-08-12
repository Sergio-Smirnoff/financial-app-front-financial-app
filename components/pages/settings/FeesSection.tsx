'use client'

import React from 'react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { FeeTable, type FeeRowData } from '@/components/ui-kit/data/FeeTable'
import type { Section } from '@/lib/api/bff/types'
import type { components } from '@/lib/api/bff/schema'

type FeesSummaryResponse = components['schemas']['FeesSummaryResponse']
type FeeRowResponse = components['schemas']['FeeRowResponse']

export interface FeesSectionProps {
  section?: any
  isLoading: boolean
  onRetry?: () => void
}

function mapRows(rows?: FeeRowResponse[] | null, scopeDefault: string = ''): FeeRowData[] {
  return (rows ?? []).map((r) => ({
    scope: r.scope ?? scopeDefault,
    label: r.label ?? '',
    amount: r.amount ? { amount: r.amount.amount ?? '0', currency: r.amount.currency ?? 'ARS', secondary: null } : null,
    pct: r.pct ?? null,
    ivaTreatment: r.ivaTreatment ?? 'EXEMPT',
  }))
}

export function FeesSection({ section, isLoading, onRetry }: FeesSectionProps) {
  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-48 rounded-xl bg-muted animate-pulse" />}
    >
      {(fees: any) => {
        const accountsRows = mapRows(fees.accounts, 'Cuentas')
        const cardsRows = mapRows(fees.cards, 'Tarjetas')
        const brokersRows = mapRows(fees.brokers, 'Brokers')
        const taxRate = fees.debitCreditTaxRate ?? 0

        return (
          <div id="fees" className="elev-sm rounded-xl border bg-card p-6 space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h3 className="section-head">Comisiones y Costos</h3>
              <div data-testid="debit-credit-tax" className="text-xs text-muted-foreground font-mono">
                Impuesto débito/crédito: {(taxRate * 100).toFixed(2).replace('.', ',')} % ({taxRate})
              </div>
            </div>

            <div className="space-y-6">
              <div data-testid="fees-accounts" className="space-y-2">
                <h4 className="text-sm font-semibold">Cuentas</h4>
                {accountsRows.length > 0 ? (
                  <FeeTable rows={accountsRows} />
                ) : (
                  <p className="text-xs text-muted-foreground italic">Sin comisiones de cuentas configuradas</p>
                )}
              </div>

              <div data-testid="fees-cards" className="space-y-2">
                <h4 className="text-sm font-semibold">Tarjetas</h4>
                {cardsRows.length > 0 ? (
                  <FeeTable rows={cardsRows} />
                ) : (
                  <p className="text-xs text-muted-foreground italic">Sin comisiones de tarjetas configuradas</p>
                )}
              </div>

              <div data-testid="fees-brokers" className="space-y-2">
                <h4 className="text-sm font-semibold">Brokers e Inversiones</h4>
                {brokersRows.length > 0 ? (
                  <FeeTable rows={brokersRows} />
                ) : (
                  <p className="text-xs text-muted-foreground italic">Sin comisiones de brokers configuradas</p>
                )}
              </div>
            </div>
          </div>
        )
      }}
    </SectionState>
  )
}
