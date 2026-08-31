'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('transactions')
  const targetId = selectedId ?? id ?? null
  const handleClose = onClose ?? (() => {})
  const { data: bff } = useTransactionDetail(targetId)

  const detailData = bff?.detail?.data
  const tx = detailData?.transaction
  const origin = detailData?.origin

  const items = tx
    ? [
        {
          term: t('detail.amount'),
          detail: (
            <Money
              value={tx.amount}
              tone={tx.direction === 'IN' ? 'gain' : 'loss'}
            />
          ),
        },
        { term: t('detail.account'), detail: tx.accountAlias || tx.accountCbu || '–' },
        { term: t('detail.category'), detail: tx.categoryName || t('uncategorisedValue') },
        { term: t('method'), detail: formatPaymentMethod(tx.method) },
        { term: t('detail.note'), detail: tx.note && tx.note !== 'null' ? tx.note : '–' },
        {
          term: t('detail.origin'),
          detail: (
            <span data-testid="tx-origin-file">
              {origin?.fileName || (origin ? t('detail.run', { id: origin.runId ?? '' }) : t('manual'))}
            </span>
          ),
        },
        {
          term: t('detail.status'),
          detail: (
            <StatusDot
              tone={origin?.reconciled ? 'ok' : 'neutral'}
              label={origin?.reconciled ? t('detail.reconciled') : t('detail.pending')}
            />
          ),
        },
      ]
    : []

  return (
    <SidePanel
      open={targetId !== null && targetId !== undefined}
      onClose={handleClose}
      title={tx?.description || t('detail.title')}
    >
      <div className="space-y-4 pt-2">
        <DetailList items={items} />
      </div>
    </SidePanel>
  )
}
