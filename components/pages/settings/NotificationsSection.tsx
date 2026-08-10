'use client'

import React from 'react'
import { ToggleRow } from '@/components/ui-kit/controls/Toolbar'

export interface NotificationsSectionProps {
  paymentDue: boolean
  onPaymentDueChange: (val: boolean) => void
  budgetOverrun: boolean
  onBudgetOverrunChange: (val: boolean) => void
}

export function NotificationsSection({
  paymentDue,
  onPaymentDueChange,
  budgetOverrun,
  onBudgetOverrunChange,
}: NotificationsSectionProps) {
  return (
    <div id="notifications" className="elev-sm rounded-xl border bg-card p-6 space-y-6">
      <h3 className="section-head">Notificaciones</h3>

      <div className="space-y-4">
        <ToggleRow
          id="payment-due-toggle"
          label="Vencimiento de tarjetas y cuotas"
          description="Recibir alertas antes de la fecha de vencimiento de tus tarjetas de crédito y cuotas de préstamos."
          checked={paymentDue}
          onCheckedChange={onPaymentDueChange}
        />

        <ToggleRow
          id="budget-overrun-toggle"
          label="Exceso de presupuesto"
          description="Alertar cuando el gasto acumulado supere el límite asignado a una categoría."
          checked={budgetOverrun}
          onCheckedChange={onBudgetOverrunChange}
        />
      </div>
    </div>
  )
}
