'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { DonutChart } from '@/components/charts/DonutChart'
import { formatCompactMoney, formatMoney, formatPercent } from '@/lib/format'
import type { AssetTypeSlice, InvestmentsKpis, MoneyView, Section } from '@/lib/api/bff/types'
import { GROUP_COLOR, GROUP_LABEL_KEYS, amountOf, groupKeyOf, orderSlices, toneOf } from './portfolioView'

export interface CompositionCardProps {
  section?: Section<AssetTypeSlice[]>
  kpis?: InvestmentsKpis | null
  isLoading: boolean
  onRetry?: () => void
}

const TONE_TEXT = { gain: 'text-gain', loss: 'text-loss', neutral: 'text-muted-foreground' } as const
const PNL_AMOUNT = 'max-[1441px]:hidden'

function Compact({ value }: { value?: MoneyView | null }) {
  if (!value) return <span className="text-muted-foreground">—</span>
  return <span title={formatMoney({ ...value, secondary: null })}>{formatCompactMoney(amountOf(value), value.currency)}</span>
}

export function CompositionCard({ section, kpis, isLoading, onRetry }: CompositionCardProps) {
  const t = useTranslations('investments')
  const hasValue = section?.data?.some((s) => amountOf(s.amount) > 0) ?? false
  const composed = section?.data && !hasValue ? { ...section, data: [] } : section

  return (
    <div data-testid="composition-card" className="elev-sm relative rounded-xl border bg-card p-5 flex h-full min-h-0 min-w-0 flex-col gap-3 frame:overflow-hidden max-md:p-3.5 short:gap-2 short:p-4">
      <h3 className="section-head">{t('composition.heading')}</h3>
      <SectionState
        section={composed}
        isLoading={isLoading}
        onRetry={onRetry}
        emptyTitle={t('composition.empty')}
        emptyTestId="composition-empty"
        skeleton={<div className="h-48 rounded-lg bg-muted animate-pulse" />}
      >
        {(slices) => {
          const ordered = orderSlices(slices)
          const positions = ordered.reduce((sum, s) => sum + (s.count ?? 0), 0)
          const marketValue = kpis?.marketValue

          return (
            <>
              <p className="-mt-2 text-xs text-muted-foreground">{t('composition.positionsCount', { count: positions })}</p>
              <div className="h-56 min-h-0 frame:h-auto frame:flex-1">
                <DonutChart
                  minHeight={96}
                  ariaLabel={t('composition.donutAria')}
                  centerLabel={t('composition.centerLabel')}
                  centerValue={marketValue ? formatCompactMoney(amountOf(marketValue), marketValue.currency) : '—'}
                  centerDelta={kpis?.pnlPct != null ? { text: formatPercent(kpis.pnlPct), tone: toneOf(kpis.pnlPct) } : undefined}
                  slices={ordered.map((s, index) => {
                    const key = groupKeyOf(s.assetType)
                    return { key: `${s.assetType ?? key}-${index}`, label: t(GROUP_LABEL_KEYS[key]), value: amountOf(s.amount), pct: s.pct ?? 0, color: GROUP_COLOR[key] }
                  })}
                />
              </div>
              <table className="w-full table-auto text-xs short:hidden max-md:text-[11.5px]">
                <caption className="sr-only">{t('composition.heading')}</caption>
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th scope="col" className="py-1 text-left font-medium">{t('composition.colType')}</th>
                    <th scope="col" className="py-1 text-right font-medium">{t('composition.colCount')}</th>
                    <th scope="col" className="py-1 text-right font-medium">{t('composition.colShare')}</th>
                    <th scope="col" className="py-1 text-right font-medium">{t('composition.colAmount')}</th>
                    <th scope="col" className={`py-1 text-right font-medium ${PNL_AMOUNT}`}>{t('composition.colPnl')}</th>
                    <th scope="col" className="py-1 text-right font-medium">{t('composition.colPnlPct')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ordered.map((s, index) => {
                    const key = groupKeyOf(s.assetType)
                    const tone = TONE_TEXT[toneOf(s.pnlPct)]
                    return (
                      <tr key={`${s.assetType ?? key}-${index}`} data-testid="composition-row" data-asset-type={key} className="border-b last:border-0">
                        <td className="max-w-0 truncate py-1" title={t(GROUP_LABEL_KEYS[key])}>
                          <span className="mr-1.5 inline-block h-2 w-2 rounded-sm" style={{ background: GROUP_COLOR[key] }} />
                          {t(GROUP_LABEL_KEYS[key])}
                        </td>
                        <td className="py-1 text-right font-mono">{s.count ?? 0}</td>
                        <td className="whitespace-nowrap py-1 text-right font-mono">{formatPercent(s.pct ?? 0, { decimals: 1, signed: false })}</td>
                        <td className="whitespace-nowrap py-1 text-right font-mono"><Compact value={s.amount} /></td>
                        <td className={`whitespace-nowrap py-1 text-right font-mono ${tone} ${PNL_AMOUNT}`}><Compact value={s.pnl} /></td>
                        <td className={`whitespace-nowrap py-1 text-right font-mono ${tone}`}>{s.pnlPct != null ? formatPercent(s.pnlPct) : '—'}</td>
                      </tr>
                    )
                  })}
                  <tr className="font-semibold">
                    <td className="py-1">{t('composition.total')}</td>
                    <td className="py-1 text-right font-mono">{positions}</td>
                    <td className="whitespace-nowrap py-1 text-right font-mono">{formatPercent(100, { decimals: 0, signed: false })}</td>
                    <td className="whitespace-nowrap py-1 text-right font-mono"><Compact value={marketValue} /></td>
                    <td className={`whitespace-nowrap py-1 text-right font-mono ${TONE_TEXT[toneOf(kpis?.pnlPct)]} ${PNL_AMOUNT}`}>
                      <Compact value={kpis?.pnl} />
                    </td>
                    <td className={`whitespace-nowrap py-1 text-right font-mono ${TONE_TEXT[toneOf(kpis?.pnlPct)]}`}>
                      {kpis?.pnlPct != null ? formatPercent(kpis.pnlPct) : '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          )
        }}
      </SectionState>
    </div>
  )
}
