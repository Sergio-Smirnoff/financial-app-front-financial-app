'use client'

import { useTranslations } from 'next-intl'
import { useMarketDiscovery } from '@/lib/hooks/useInvestments'
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Flame, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { Surface } from '@/components/shared/Surface'
import { cn } from '@/lib/utils'

export function MarketDiscoveryCard() {
  const t = useTranslations('investments')
  const { data, isLoading } = useMarketDiscovery(5)

  if (isLoading) {
    return (
      <Surface className="h-[200px] flex items-center justify-center text-center p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
          {t('market.scanning')}
        </p>
      </Surface>
    )
  }

  if (data && !data.marketDataAvailable) {
    return (
      <Surface className="h-[200px] flex items-center justify-center text-center p-4">
        <p className="text-sm text-muted-foreground py-6 text-center">
          {t('market.unavailable')}
        </p>
      </Surface>
    )
  }

  if (!data || data.opportunities.length === 0) {
    return (
      <Surface className="h-[200px] flex items-center justify-center text-center p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
          {t('market.noOpportunities')}
        </p>
      </Surface>
    )
  }

  return (
    <Surface>
      <CardHeader className="pb-2">
        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Flame className="h-3.5 w-3.5 text-orange-500" />
          {t('market.discoveryTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.opportunities.map((op) => (
          <div key={op.ticker} className="flex items-center justify-between group">
            <div className="flex flex-col">
              <span className="text-sm font-black">{op.ticker}</span>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">{t('market.iolTrending')}</span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-xs font-black">{formatCurrency(op.price, 'ARS')}</span>
              <div className={cn(
                "text-[10px] font-black flex items-center gap-0.5",
                op.variation >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {op.variation >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                {op.variation >= 0 ? '+' : ''}{op.variation.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Surface>
  )
}
