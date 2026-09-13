'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AreaChart } from '@/components/charts/AreaChart'
import { Money } from '@/components/ui-kit/money/Money'
import { DeltaBadge } from '@/components/ui-kit/money/DeltaBadge'
import { KpiStrip, KpiTile } from '@/components/ui-kit/layout/KpiStrip'
import { Button } from '@/components/ui/button'
import { SellHoldingDialog } from './SellHoldingDialog'
import { RecordHoldingDialog } from './RecordHoldingDialog'
import type { MoneyView } from '@/lib/format'
import type { AssetType } from '@/types/investments'

export interface PositionDetailData {
  id: number
  ticker: string
  name: string
  assetType: string
  quantity: number
  avgPrice: MoneyView
  currentPrice: MoneyView
  totalValue: MoneyView
  pnl: { amount: MoneyView; pct: number }
  prices: { date: string; value: number }[]
}

export interface PositionDetailProps {
  holding: PositionDetailData
  onSold?: () => void
}

export function PositionDetail({ holding, onSold }: PositionDetailProps) {
  const t = useTranslations('investments')
  const tc = useTranslations('common')
  let router: any = null
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    router = useRouter()
  } catch {
    // In unit test environments without Next.js App Router context
  }

  const [sellOpen, setSellOpen] = useState(false)
  const [buyOpen, setBuyOpen] = useState(false)

  const parseNum = (val: MoneyView): number => {
    if (typeof val.amount === 'string') return parseFloat(val.amount) || 0
    return (val.amount as unknown as number) || 0
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/investments" className="text-xs text-primary hover:underline font-medium mb-1 inline-block">
            ← {t('holdings.backToInvestments')}
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-mono font-bold tracking-tight">{holding.ticker}</h1>
            <span className="text-sm text-muted-foreground">{holding.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DeltaBadge pct={holding.pnl.pct} absolute={holding.pnl.amount} />
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 font-bold"
            onClick={() => setSellOpen(true)}
          >
            {t('holdings.sellAction')}
          </Button>
          <Button
            size="sm"
            className="font-bold"
            onClick={() => setBuyOpen(true)}
          >
            {t('holdings.buyMore')}
          </Button>
        </div>
      </div>

      <KpiStrip>
        <KpiTile label={tc('quantity')} value={String(holding.quantity)} />
        <KpiTile label={t('holdings.avgPrice')} value={<Money value={holding.avgPrice} />} />
        <KpiTile label={t('holdings.currentPrice')} value={<Money value={holding.currentPrice} />} />
        <KpiTile label={t('shared.totalValue')} value={<Money value={holding.totalValue} />} />
      </KpiStrip>

      <div className="elev-sm rounded-xl border bg-card p-6 space-y-4">
        <h3 className="section-head">{t('holdings.priceHistoryHeading')}</h3>
        <AreaChart
          series={holding.prices}
          currency={holding.currentPrice.currency}
          ariaLabel={t('holdings.priceHistoryAria', { ticker: holding.ticker })}
        />
      </div>

      <SellHoldingDialog
        holding={{
          id: holding.id,
          ticker: holding.ticker,
          name: holding.name,
          quantity: holding.quantity,
          currency: holding.currentPrice.currency,
          currentPrice: parseNum(holding.currentPrice),
          avgPurchasePrice: parseNum(holding.avgPrice),
        }}
        open={sellOpen}
        onOpenChange={setSellOpen}
        onSuccess={() => {
          if (onSold) {
            onSold()
          } else {
            router?.push('/investments')
          }
        }}
      />

      <RecordHoldingDialog
        open={buyOpen}
        onOpenChange={setBuyOpen}
        initialTicker={holding.ticker}
        initialName={holding.name}
        initialAssetType={(holding.assetType as AssetType) || 'STOCK'}
        initialPrice={parseNum(holding.currentPrice)}
        initialCurrency={(holding.currentPrice.currency as 'ARS' | 'USD') || 'ARS'}
      />
    </div>
  )
}
