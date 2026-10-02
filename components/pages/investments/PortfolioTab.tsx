'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { Money } from '@/components/ui-kit/money/Money'
import { Button } from '@/components/ui/button'
import { formatPercent, formatQuantity } from '@/lib/format'
import { useHoldings } from '@/lib/hooks/useInvestments'
import type { AssetTypeSlice, InvestmentsKpis, PositionRow, Section } from '@/lib/api/bff/types'
import type { Holding } from '@/types/investments'
import { SellHoldingDialog, type SellHoldingTarget } from './SellHoldingDialog'
import { GROUP_LABEL_KEYS, amountOf, groupPositions, portfolioShare, toneOf, type GroupKey } from './portfolioView'

export interface PortfolioTabProps {
  positionsSection?: Section<PositionRow[]>
  compositionSection?: Section<AssetTypeSlice[]>
  kpis?: InvestmentsKpis | null
  isLoading: boolean
  onRetry?: () => void
  onOpenCreate?: () => void
}

const TONE_TEXT = { gain: 'text-gain', loss: 'text-loss', neutral: '' } as const
const share = (pct?: number | null) => (pct == null ? '—' : formatPercent(pct, { decimals: 1, signed: false }))
const signedPct = (pct?: number | null) => (pct == null ? '—' : formatPercent(pct))

function sellTargetFor(row: PositionRow, holding: Holding): SellHoldingTarget {
  return {
    id: holding.id,
    ticker: holding.ticker,
    name: holding.name,
    assetType: holding.assetType,
    quantity: holding.quantity,
    exactQuantity: holding.exactQuantity,
    currency: holding.currency,
    currentPrice: row.price?.currency === holding.currency ? amountOf(row.price) : null,
    avgPurchasePrice: holding.avgPurchasePrice,
  }
}

export function PortfolioTab({
  positionsSection,
  compositionSection,
  kpis,
  isLoading,
  onRetry,
  onOpenCreate,
}: PortfolioTabProps) {
  const t = useTranslations('investments')
  const tc = useTranslations('common')
  const { data: holdings, isError: holdingsFailed, refetch: refetchHoldings } = useHoldings()
  const [collapsed, setCollapsed] = useState<ReadonlySet<GroupKey>>(new Set())
  const [selling, setSelling] = useState<SellHoldingTarget | null>(null)

  const holdingsById = useMemo(() => new Map((holdings ?? []).map((h) => [h.id, h])), [holdings])
  const slices = compositionSection?.status === 'OK' ? compositionSection.data ?? [] : null

  const toggle = (key: GroupKey) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  return (
    <div className="elev-sm rounded-xl border bg-card flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
        <h3 className="section-head">{t('tabs.positionsHeading')}</h3>
        {onOpenCreate && (
          <Button size="sm" data-testid="register-holding-trigger" onClick={onOpenCreate} className="h-8 gap-1.5 text-xs font-semibold">
            <Plus className="h-3.5 w-3.5" />
            {t('holdings.new')}
          </Button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-5 pb-4">
        {holdingsFailed && (
          <div className="mb-2 flex items-center justify-between gap-3 rounded-md border border-border bg-muted/60 px-3 py-1.5 text-xs">
            <span id="holdings-unavailable" className="text-muted-foreground">{t('holdings.sell.unavailable')}</span>
            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => refetchHoldings()}>
              {tc('retry')}
            </Button>
          </div>
        )}
        <SectionState
          section={positionsSection}
          isLoading={isLoading}
          onRetry={onRetry}
          emptyTitle={t('tabs.positionsEmptyTitle')}
          emptyDescription={t('tabs.positionsEmptyDescription')}
          emptyTestId="positions-empty"
          emptyAction={
            onOpenCreate && (
              <Button size="sm" data-testid="positions-empty-register" onClick={onOpenCreate} className="gap-1.5 font-bold">
                <Plus className="h-4 w-4" />
                {t('holdings.new')}
              </Button>
            )
          }
          skeleton={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
        >
          {(positions) => (
            <div data-testid="positions-scroll" className="relative max-h-[70vh] min-h-0 flex-1 overflow-auto frame:max-h-none">
              <table className="w-full text-sm">
                <caption className="sr-only">{t('tabs.positionsCaption')}</caption>
                <thead className="sticky top-0 z-10 bg-card">
                  <tr className="border-b text-left text-muted-foreground">
                    <th scope="col" className="py-2 px-2">{tc('ticker')}</th>
                    <th scope="col" className="py-2 px-2">{t('tabs.colName')}</th>
                    <th scope="col" className="py-2 px-2 text-right">{tc('quantity')}</th>
                    <th scope="col" className="py-2 px-2 text-right">{t('tabs.colAvgCost')}</th>
                    <th scope="col" className="py-2 px-2 text-right">{t('tabs.colPrice')}</th>
                    <th scope="col" className="py-2 px-2 text-right">{t('shared.totalValue')}</th>
                    <th scope="col" className="py-2 px-2 text-right">{t('tabs.colShare')}</th>
                    <th scope="col" className="py-2 px-2 text-right">{t('tabs.colPnlAmount')}</th>
                    <th scope="col" className="py-2 px-2 text-right">{t('tabs.colPnlPct')}</th>
                    <th scope="col" className="py-2 px-2 text-center">{tc('actions')}</th>
                  </tr>
                </thead>
                {groupPositions(positions, slices).map((group) => {
                  const isCollapsed = collapsed.has(group.key)
                  const slice = group.slice
                  return (
                    <tbody key={group.key} data-testid="position-group" data-asset-type={group.key}>
                      <tr className="border-b bg-muted/40 font-semibold">
                        <th scope="rowgroup" colSpan={5} className="py-2 px-2 text-left">
                          <button
                            type="button"
                            aria-expanded={!isCollapsed}
                            onClick={() => toggle(group.key)}
                            className="flex items-center gap-1.5"
                          >
                            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            {t(GROUP_LABEL_KEYS[group.key])}
                            <span className="font-normal text-muted-foreground">
                              · {t('composition.positionsCount', { count: slice?.count ?? group.rows.length })}
                            </span>
                          </button>
                        </th>
                        <td data-testid="group-subtotal" className="py-2 px-2 text-right font-mono">
                          {slice && <Money value={slice.amount} />}
                        </td>
                        <td className="py-2 px-2 text-right font-mono">{slice && share(slice.pct)}</td>
                        <td className="py-2 px-2 text-right font-mono">
                          {slice && <Money value={slice.pnl} tone={toneOf(slice.pnlPct)} />}
                        </td>
                        <td className={`py-2 px-2 text-right font-mono ${TONE_TEXT[toneOf(slice?.pnlPct)]}`}>
                          {slice && signedPct(slice.pnlPct)}
                        </td>
                        <td />
                      </tr>
                      {!isCollapsed &&
                        group.rows.map((row) => {
                          const holding = row.holdingId != null ? holdingsById.get(row.holdingId) : undefined
                          return (
                            <tr key={row.holdingId} data-testid="position-row" className="border-b last:border-0 hover:bg-muted/30 transition">
                              <td className="py-2 px-2">
                                <Link href={`/investments/holdings/${row.holdingId}`} className="font-mono font-semibold text-primary hover:underline">
                                  {row.ticker}
                                </Link>
                              </td>
                              <td className="max-w-[14rem] truncate py-2 px-2" title={row.name}>{row.name}</td>
                              <td className="py-2 px-2 text-right font-mono">{formatQuantity(row.quantity)}</td>
                              <td className="py-2 px-2 text-right font-mono"><Money value={row.avgCost} /></td>
                              <td className="py-2 px-2 text-right font-mono"><Money value={row.price} /></td>
                              <td className="py-2 px-2 text-right font-mono"><Money value={row.marketValue} /></td>
                              <td className="py-2 px-2 text-right font-mono">{share(portfolioShare(row.marketValue, kpis?.marketValue))}</td>
                              <td className="py-2 px-2 text-right font-mono"><Money value={row.pnl} tone={toneOf(row.pnlPct)} /></td>
                              <td className={`py-2 px-2 text-right font-mono ${TONE_TEXT[toneOf(row.pnlPct)]}`}>{signedPct(row.pnlPct)}</td>
                              <td className="whitespace-nowrap py-2 px-2 text-center">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={!holding}
                                  title={holdingsFailed ? t('holdings.sell.unavailable') : undefined}
                                  aria-describedby={holdingsFailed ? 'holdings-unavailable' : undefined}
                                  className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 font-bold"
                                  onClick={() => holding && setSelling(sellTargetFor(row, holding))}
                                >
                                  {t('holdings.sellAction')}
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  )
                })}
              </table>
            </div>
          )}
        </SectionState>
      </div>

      <SellHoldingDialog holding={selling} open={!!selling} onOpenChange={(open) => !open && setSelling(null)} />
    </div>
  )
}
