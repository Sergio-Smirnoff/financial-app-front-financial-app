'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AreaChart } from '@/components/charts/AreaChart'
import { FitAmount } from '@/components/ui-kit/money/FitAmount'
import { DeltaBadge } from '@/components/ui-kit/money/DeltaBadge'
import { KpiStrip, KpiTile } from '@/components/ui-kit/layout/KpiStrip'
import { Button } from '@/components/ui/button'
import { SellHoldingDialog } from './SellHoldingDialog'
import { amountOf, formatQuantity, type MoneyView } from '@/lib/format'
import { useHoldingDraftStore } from '@/lib/store/holdingDraft.store'
import type { AssetType } from '@/types/investments'

export interface PositionFigures {
  avgCost?: MoneyView | null
  price?: MoneyView | null
  marketValue?: MoneyView | null
  pnl?: MoneyView | null
  pnlPct?: number | null
}

export interface PositionDetailData {
  id: number
  ticker: string
  name: string
  assetType: string
  currency: string
  quantity: number
  exactQuantity?: string
  avgPurchasePrice?: number | null
  figures: PositionFigures | null
  prices: { date: string; value: number }[]
}

const ASSET_TYPES: readonly AssetType[] = ['STOCK', 'BOND', 'CEDEAR', 'FCI']
const isAssetType = (value: string): value is AssetType => (ASSET_TYPES as readonly string[]).includes(value)

export interface PositionDetailProps {
  holding: PositionDetailData
  figuresPending?: boolean
  onSold?: () => void
}

export function PositionDetail({ holding, figuresPending = false, onSold }: PositionDetailProps) {
  const t = useTranslations('investments')
  const tc = useTranslations('common')
  const router = useRouter()
  const openCreate = useHoldingDraftStore((s) => s.openCreate)
  const openEdit = useHoldingDraftStore((s) => s.openEdit)

  const [sellOpen, setSellOpen] = useState(false)
  const figures = holding.figures
  const quote = figures?.price?.currency === holding.currency ? amountOf(figures.price) : 0
  const marketPrice = quote > 0 ? quote : null

  const buyMore = () => {
    openCreate({
      ticker: holding.ticker,
      name: holding.name,
      assetType: isAssetType(holding.assetType) ? holding.assetType : undefined,
      price: holding.assetType === 'BOND' ? undefined : (marketPrice ?? undefined),
      currency: holding.currency === 'USD' ? 'USD' : 'ARS',
    })
    router.push('/investments?tab=cartera')
  }

  const edit = () => {
    openEdit(holding.id)
    router.push('/investments?tab=cartera')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/investments?tab=cartera" className="text-xs text-primary hover:underline font-medium mb-1 inline-block">
            ← {t('holdings.backToInvestments')}
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-mono font-bold tracking-tight">{holding.ticker}</h1>
            <span className="text-sm text-muted-foreground">{holding.name}</span>
          </div>
        </div>

        <div data-testid="position-actions" className="flex flex-wrap items-center gap-3">
          {figures?.pnlPct != null && <DeltaBadge pct={figures.pnlPct} absolute={figures.pnl ?? undefined} />}
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 font-bold"
            onClick={() => setSellOpen(true)}
          >
            {t('holdings.sellAction')}
          </Button>
          <Button variant="outline" size="sm" className="font-bold" onClick={edit}>
            {t('holdings.editAction')}
          </Button>
          <Button
            size="sm"
            className="font-bold"
            onClick={buyMore}
          >
            {t('holdings.buyMore')}
          </Button>
        </div>
      </div>

      <KpiStrip>
        <KpiTile label={tc('quantity')} value={formatQuantity(holding.exactQuantity ?? holding.quantity)} />
        <KpiTile label={t('holdings.avgPrice')} value={<div data-testid="position-kpi"><FitAmount value={figures?.avgCost} /></div>} />
        <KpiTile label={t('holdings.currentPrice')} value={<div data-testid="position-kpi"><FitAmount value={figures?.price} /></div>} />
        <KpiTile label={t('shared.totalValue')} value={<div data-testid="position-kpi"><FitAmount value={figures?.marketValue} /></div>} />
      </KpiStrip>
      {!figuresPending && !figures && (
        <p data-testid="position-figures-unavailable" role="status" className="text-sm text-muted-foreground">
          {t('holdings.figuresUnavailable')}
        </p>
      )}

      <div className="elev-sm rounded-xl border bg-card p-6 space-y-4">
        <h3 className="section-head">{t('holdings.priceHistoryHeading')}</h3>
        <AreaChart
          series={holding.prices}
          currency={holding.currency}
          ariaLabel={t('holdings.priceHistoryAria', { ticker: holding.ticker })}
        />
      </div>

      <SellHoldingDialog
        holding={{
          id: holding.id,
          ticker: holding.ticker,
          name: holding.name,
          assetType: holding.assetType,
          quantity: holding.quantity,
          exactQuantity: holding.exactQuantity,
          currency: holding.currency,
          currentPrice: marketPrice,
          avgPurchasePrice: holding.avgPurchasePrice,
        }}
        open={sellOpen}
        onOpenChange={setSellOpen}
        onSuccess={() => {
          if (onSold) {
            onSold()
          } else {
            router.push('/investments?tab=cartera')
          }
        }}
      />
    </div>
  )
}
