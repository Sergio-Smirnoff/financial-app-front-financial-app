'use client'

import { useTranslations } from 'next-intl'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { PortfolioSummary } from '@/types/investments'
import { Surface } from '@/components/shared/Surface'

interface PortfolioSummaryCardProps {
  summary: PortfolioSummary
}

function PlValue({ amount, percent, currency }: { amount: number; percent: number; currency: string }) {
  const isPositive = amount >= 0
  return (
    <div className="flex items-baseline gap-1">
      <span className={cn('text-sm font-semibold', isPositive ? 'text-green-600 dark:text-green-400' : 'text-destructive')}>
        {isPositive ? '+' : ''}{formatCurrency(amount, currency)}
      </span>
      <span className={cn('text-xs', isPositive ? 'text-green-600 dark:text-green-400' : 'text-destructive')}>
        ({isPositive ? '+' : ''}{percent.toFixed(2)}%)
      </span>
    </div>
  )
}

function CurrencyPanel({
  label,
  totalValue,
  plAmount,
  plPercent,
  currency,
  divider,
}: {
  label: string
  totalValue: number
  plAmount: number
  plPercent: number
  currency: string
  divider?: boolean
}) {
  const t = useTranslations('investments')

  return (
    <div className={cn('space-y-1 px-2', divider && 'sm:border-l sm:border-border sm:pl-6')}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-2xl font-black tracking-tight">{formatCurrency(totalValue, currency)}</p>
      <PlValue amount={plAmount} percent={plPercent} currency={currency} />
      <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">{t('market.readOnly')}</p>
    </div>
  )
}

export function PortfolioSummaryCard({ summary }: PortfolioSummaryCardProps) {
  const t = useTranslations('investments')
  const hasArs = summary.totalValueArs > 0 || summary.totalPlArs !== 0
  const hasUsd = summary.totalValueUsd > 0 || summary.totalPlUsd !== 0

  if (!hasArs && !hasUsd) {
    return (
      <Surface className="bg-gradient-to-b from-muted/40 to-card">
        <CardContent className="py-8">
          <p className="text-sm text-muted-foreground text-center">
            {t('market.summaryEmpty')}
          </p>
        </CardContent>
      </Surface>
    )
  }

  return (
    <Surface className="bg-gradient-to-b from-muted/40 to-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {t('market.portfolioTotal')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-0">
          {hasArs && (
            <CurrencyPanel
              label="ARS"
              totalValue={summary.totalValueArs}
              plAmount={summary.totalPlArs}
              plPercent={summary.plPercentArs}
              currency="ARS"
            />
          )}
          {hasUsd && (
            <CurrencyPanel
              label="USD"
              totalValue={summary.totalValueUsd}
              plAmount={summary.totalPlUsd}
              plPercent={summary.plPercentUsd}
              currency="USD"
              divider={hasArs}
            />
          )}
        </div>
      </CardContent>
    </Surface>
  )
}
