'use client'

import React from 'react'
import { SidePanel } from '@/components/ui-kit/overlay/SidePanel'
import { DetailList } from '@/components/ui-kit/row/DetailList'
import { Money } from '@/components/ui-kit/money/Money'
import { StatusDot } from '@/components/ui-kit/row/StatusDot'
import { useTransactionDetail } from '@/lib/hooks/useTransactionDetail'

export interface TransactionDetailPanelProps {
  selectedId: number | null
  onClose: () => void
}

export function TransactionDetailPanel({ selectedId, onClose }: TransactionDetailPanelProps) {
  const { data: detail } = useTransactionDetail(selectedId)

  const items = detail
    ? [
        { label: 'Importe', value: <Money value={detail.amount || { amount: '0', currency: 'ARS', secondary: null }} tone={detail.direction === 'IN' ? 'gain' : 'loss'} /> },
        { label: 'Cuenta', value: detail.accountAlias || detail.accountCbu || '–' },
        { label: 'Categoría', value: detail.categoryName || 'Sin categorizar' },
        { label: 'Método', value: detail.method || 'Débito automático' },
        { label: 'Nota', value: detail.note || '–' },
        { label: 'Origen', value: detail.origin || detail.fileName || 'Manual' },
        { label: 'Estado', value: <StatusDot tone={detail.reconciled ? 'ok' : 'neutral'} label={detail.reconciled ? 'Conciliado' : 'Pendiente'} /> },
      ]
    : []

  return (
    <SidePanel
      open={selectedId !== null}
      onClose={onClose}
      title={detail?.description || 'Detalle del movimiento'}
    >
      <div className="space-y-4 pt-2">
        <DetailList items={items} />
      </div>
    </SidePanel>
  )
}
