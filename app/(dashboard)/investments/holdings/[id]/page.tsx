'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { PositionDetail, type PositionDetailData } from '@/components/pages/investments/PositionDetail'
import { useHoldings, useTickerResearch } from '@/lib/hooks/useInvestments'

export default function HoldingDetailPage() {
  const t = useTranslations('investments')
  const tc = useTranslations('common')
  const { id } = useParams<{ id: string }>()
  const { data: holdings = [], isLoading, isError, isFetching, refetch } = useHoldings()

  const holdingId = Number.parseInt(id ?? '', 10)
  const holding = holdings.find((h) => h.id === holdingId)

  const { data: research } = useTickerResearch(holding?.ticker ?? null, 'D90')

  const detailData: PositionDetailData | null = useMemo(() => {
    if (!holding) return null

    const curPrice = research?.currentPrice ?? holding.avgPurchasePrice
    const totalVal = holding.quantity * curPrice
    const totalCost = holding.quantity * holding.avgPurchasePrice
    const pnlVal = totalVal - totalCost
    const pnlPct = totalCost > 0 ? (pnlVal / totalCost) * 100 : 0

    const prices = (research?.series ?? []).map((pt) => ({
      date: pt.date,
      value: pt.price,
    }))

    return {
      id: holding.id,
      ticker: holding.ticker,
      name: holding.name,
      assetType: holding.assetType,
      quantity: holding.quantity,
      exactQuantity: holding.exactQuantity,
      avgPrice: { amount: String(holding.avgPurchasePrice), currency: holding.currency, secondary: null },
      currentPrice: { amount: String(curPrice), currency: holding.currency, secondary: null },
      totalValue: { amount: String(totalVal), currency: holding.currency, secondary: null },
      pnl: {
        amount: { amount: String(pnlVal), currency: holding.currency, secondary: null },
        pct: pnlPct,
      },
      prices: prices.length > 0 ? prices : [
        { date: holding.createdAt.split('T')[0], value: holding.avgPurchasePrice },
        { date: new Date().toISOString().split('T')[0], value: curPrice },
      ],
    }
  }, [holding, research])

  if (isLoading && !holding) {
    return (
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div className="h-10 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-24 rounded-xl bg-muted animate-pulse" />
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </main>
    )
  }

  if (!detailData) {
    return (
      <main className="flex-1 overflow-auto p-6">
        {isError ? (
          <div data-testid="holding-load-error" className="elev-sm mx-auto max-w-md space-y-3 rounded-xl border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">{t('holdings.loadFailed')}</p>
            <Button size="sm" variant="outline" disabled={isFetching} onClick={() => refetch()}>
              {tc('retry')}
            </Button>
          </div>
        ) : (
          <div data-testid="holding-not-found" className="elev-sm mx-auto max-w-md space-y-3 rounded-xl border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">{t('holdings.notFound')}</p>
            <Link href="/investments?tab=cartera" className="text-sm font-medium text-primary hover:underline">
              ← {t('holdings.backToInvestments')}
            </Link>
          </div>
        )}
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-auto p-6">
      <PositionDetail holding={detailData} />
    </main>
  )
}
