'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { DueRow } from '@/components/ui-kit/row/ListRow'
import type { BanksBff } from '@/lib/api/bff/types'

type CalendarEntry = NonNullable<NonNullable<BanksBff['paymentCalendar']>['data']>[number]

export interface PaymentCalendarCardProps {
  entries: CalendarEntry[]
}

export function PaymentCalendarCard({ entries = [] }: PaymentCalendarCardProps) {
  const t = useTranslations('banks')

  return (
    <div data-testid="payment-calendar" className="elev-sm rounded-xl border bg-card p-5 space-y-4">
      <h3 className="section-head">{t('calendar.title')}</h3>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('calendar.empty')}</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, idx) => (
            <div key={idx} data-testid="payment-calendar-entry">
              <DueRow
                label={entry.label || t('calendar.dueFallback')}
                dueDate={entry.date || ''}
                amount={entry.amount}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
