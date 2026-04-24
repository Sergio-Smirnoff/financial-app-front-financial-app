'use client'

import { useMemo } from 'react'
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HoldingWithPrice } from '@/types/investments'
import { Surface } from '@/components/shared/Surface'

interface ActiveAlertsCardProps {
  holdings: HoldingWithPrice[]
}

export function ActiveAlertsCard({ holdings }: ActiveAlertsCardProps) {
  const alertedHoldings = useMemo(() => {
    return holdings.filter(h => h.notifyGainThresholdPct != null || h.notifyLossThresholdPct != null)
      .map(h => {
        const plPercent = h.plPercent ?? 0
        const isGainHit = h.notifyGainThresholdPct != null && plPercent >= h.notifyGainThresholdPct
        const isLossHit = h.notifyLossThresholdPct != null && plPercent <= -Math.abs(h.notifyLossThresholdPct)
        return { ...h, isGainHit, isLossHit }
      })
      .sort((a, b) => {
          if ((a.isGainHit || a.isLossHit) && !(b.isGainHit || b.isLossHit)) return -1
          if (!(a.isGainHit || a.isLossHit) && (b.isGainHit || b.isLossHit)) return 1
          return a.ticker.localeCompare(b.ticker)
      })
  }, [holdings])

  if (alertedHoldings.length === 0) return null

  return (
    <Surface>
      <CardHeader className="pb-2">
        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5" />
          Active Thresholds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alertedHoldings.map((h) => (
          <div key={h.id} className="flex items-center justify-between group">
            <div className="flex flex-col">
              <span className="text-sm font-black">{h.ticker}</span>
              <span className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter">{h.name}</span>
            </div>
            
            <div className="flex flex-col items-end">
              <div className={cn(
                "text-xs font-black flex items-center gap-1",
                h.isGainHit ? "text-green-500" : h.isLossHit ? "text-red-500" : "text-foreground"
              )}>
                {(h.plPercent ?? 0) > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {(h.plPercent ?? 0).toFixed(2)}%
              </div>
              <div className="flex gap-1 mt-0.5">
                {h.notifyGainThresholdPct && (
                    <span className={cn("text-[8px] font-black px-1 rounded-sm border uppercase", 
                        h.isGainHit ? "bg-green-500/10 border-green-500/20 text-green-500" : "border-border text-muted-foreground")}>
                        T: +{h.notifyGainThresholdPct}%
                    </span>
                )}
                {h.notifyLossThresholdPct && (
                    <span className={cn("text-[8px] font-black px-1 rounded-sm border uppercase", 
                        h.isLossHit ? "bg-red-500/10 border-red-500/20 text-red-500" : "border-border text-muted-foreground")}>
                        S: -{Math.abs(h.notifyLossThresholdPct)}%
                    </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Surface>
  )
}
