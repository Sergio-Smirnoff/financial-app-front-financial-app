'use client'

import React from 'react'
import { SidePanel } from '@/components/ui-kit/overlay/SidePanel'
import { DetailList } from '@/components/ui-kit/row/DetailList'
import { Money } from '@/components/ui-kit/money/Money'
import { StatusDot } from '@/components/ui-kit/row/StatusDot'
import { useTransactionDetail } from '@/lib/hooks/useTransactionDetail'
import { formatPaymentMethod } from '@/lib/format'

export interface TransactionDetailPanelProps {
  selectedId?: number | null
  id?: number | null
  onClose?: () => void
}

export function TransactionDetailPanel({ selectedId, id, onClose }: TransactionDetailPanelProps) {
  const targetId = selectedId ?? id ?? null
  const handleClose = onClose ?? (() => {})
  const { data: bff } = useTransactionDetail(targetId)

  const detailData = bff?.detail?.data
  const tx = detailData?.transaction
  const origin = detailData?.origin

  const items = tx
    ? [
        {
          term: 'Importe',
          detail: (
            <Money
              value={tx.amount}
              tone={tx.direction === 'IN' ? 'gain' : 'loss'}
            />
          ),
        },
        { term: 'Cuenta', detail: tx.accountAlias || tx.accountCbu || '–' },
        { term: 'Categoría', detail: tx.categoryName || 'Sin categorizar' },
        { term: 'Método', detail: formatPaymentMethod(tx.method) },
        { term: 'Nota', detail: tx.note && tx.note !== 'null' ? tx.note : '–' },
        {
          term: 'Origen',
          detail: (
            <span data-testid="tx-origin-file">
              {origin?.fileName || (origin ? `Run #${origin.runId ?? ''}` : 'Manual')}
            </span>
          ),
        },
        {
          term: 'Estado',
          detail: (
            <StatusDot
              tone={origin?.reconciled ? 'ok' : 'neutral'}
              label={origin?.reconciled ? 'Conciliado' : 'Pendiente'}
            />
          ),
        },
      ]
    : []

  return (
    <SidePanel
      open={targetId !== null && targetId !== undefined}
      onClose={handleClose}
      title={tx?.description || 'Detalle del movimiento'}
    >
      <div className="space-y-4 pt-2">
        <DetailList items={items} />
      </div>
    </SidePanel>
  )
}
