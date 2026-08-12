'use client'

import React from 'react'
import { SidePanel } from '@/components/ui-kit/overlay/SidePanel'
import { DetailList } from '@/components/ui-kit/row/DetailList'
import { Money } from '@/components/ui-kit/money/Money'
import { StatusDot } from '@/components/ui-kit/row/StatusDot'
import { useTransactionDetail } from '@/lib/hooks/useTransactionDetail'

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
          label: 'Importe',
          value: (
            <Money
              value={tx.amount || { amount: '0', currency: 'ARS', secondary: null }}
              tone={tx.direction === 'IN' ? 'gain' : 'loss'}
            />
          ),
        },
        { label: 'Cuenta', value: tx.accountAlias || tx.accountCbu || '–' },
        { label: 'Categoría', value: tx.categoryName || 'Sin categorizar' },
        { label: 'Método', value: tx.method || 'Débito automático' },
        { label: 'Nota', value: tx.note && tx.note !== 'null' ? tx.note : '–' },
        {
          label: 'Origen',
          value: (
            <span data-testid="tx-origin-file">
              {origin?.fileName || (origin ? `Run #${origin.runId ?? ''}` : 'Manual')}
            </span>
          ),
        },
        {
          label: 'Estado',
          value: (
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
      open={targetId !== null}
      onClose={handleClose}
      title={tx?.description || 'Detalle del movimiento'}
    >
      <div className="space-y-4 pt-2">
        <DetailList items={items} />
      </div>
    </SidePanel>
  )
}
