'use client'

import React from 'react'
import { DueRow } from '@/components/ui-kit/row/DueRow'
import type { CreditCardRow, LoanRow } from '@/lib/api/bff/types'

export interface PaymentCalendarCardProps {
  cards: CreditCardRow[]
  loans: LoanRow[]
}

export function PaymentCalendarCard({ cards, loans }: PaymentCalendarCardProps) {
  const cardDues = cards.map((c) => ({
    id: `card-${c.id}`,
    label: `Vencimiento ${c.cardName}`,
    dueDate: c.dueDate,
    amount: c.balance,
  }))

  const loanDues = loans.map((l) => ({
    id: `loan-${l.id}`,
    label: `Cuota ${l.title}`,
    dueDate: l.nextDueDate,
    amount: l.installmentAmount,
  }))

  const allDues = [...cardDues, ...loanDues]

  return (
    <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
      <h3 className="section-head">Próximos Vencimientos Bancarios</h3>
      {allDues.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin vencimientos cercanos.</p>
      ) : (
        <div className="space-y-3">
          {allDues.map((d) => (
            <DueRow key={d.id} label={d.label} dueDate={d.dueDate} amount={d.amount} />
          ))}
        </div>
      )}
    </div>
  )
}
