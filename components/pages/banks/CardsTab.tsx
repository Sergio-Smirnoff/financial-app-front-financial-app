'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { Money } from '@/components/ui-kit/money/Money'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { RowActions } from '@/components/ui-kit/controls/FilterBar'
import { cn } from '@/lib/utils'
import type { Section, CardRow } from '@/lib/api/bff/types'

export interface CardsTabProps {
  section?: Section<CardRow[]>
  isLoading: boolean
  onRetry?: () => void
  onAddCard?: () => void
  onViewDetail?: (card: CardRow) => void
  onAddExpense?: (card: CardRow) => void
  onDeleteCard?: (card: CardRow) => void
}

export function CardsTab({
  section,
  isLoading,
  onRetry,
  onAddCard,
  onViewDetail,
  onAddExpense,
  onDeleteCard,
}: CardsTabProps) {
  const t = useTranslations('banks')
  const tc = useTranslations('common')

  return (
    <div className="space-y-4">
      {onAddCard && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            {section?.data ? `${section.data.length} ${t('tabCards').toLowerCase()}` : ''}
          </p>
          <Button size="sm" onClick={onAddCard} className="gap-1.5 font-semibold">
            <Plus className="h-4 w-4" />
            {t('cards.add')}
          </Button>
        </div>
      )}

      <SectionState
        section={section}
        isLoading={isLoading}
        onRetry={onRetry}
        emptyAction={
          onAddCard ? (
            <Button size="sm" onClick={onAddCard}>
              {t('cards.add')}
            </Button>
          ) : undefined
        }
        skeleton={
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-44 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        }
      >
        {(cards) => (
          <div className="grid gap-4 md:grid-cols-2">
            {cards.map((card) => {
              const lastFour = card.cardNumber ? card.cardNumber.slice(-4) : '••••'
              const usedPct = card.usedPct ?? 0
              const clamped = Math.min(usedPct, 100)
              const cardName = card.alias || `${card.brand || t('cards.fallbackBrand')} •••• ${lastFour}`
              const cardUsed = card.used || { amount: '0', currency: 'ARS', secondary: null }
              const limitVal = { amount: String(card.limit ?? 0), currency: cardUsed.currency, secondary: null }

              return (
                <div key={card.cardNumber || card.alias || card.brand} className="rounded-xl border bg-card p-5 flex flex-col gap-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{cardName}</p>
                      <p className="text-xs text-muted-foreground">{card.brand || t('cards.fallbackBrand')} •••• {lastFour}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">{cardUsed.currency}</span>
                      {onDeleteCard && card.cardNumber && (
                        <RowActions
                          items={[
                            {
                              label: tc('delete'),
                              onSelect: () => onDeleteCard(card),
                              tone: 'destructive',
                            },
                          ]}
                        />
                      )}
                    </div>
                  </div>
                  <Money value={cardUsed} className="text-2xl font-bold" />
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{tc('used')}</span>
                      <span className="n">{tc('percentOfLimit', { pct: usedPct })}</span>
                    </div>
                    <div
                      role="progressbar"
                      aria-label={tc('creditLimitUsage')}
                      aria-valuenow={usedPct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
                    >
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          usedPct > 90 ? 'bg-destructive' : usedPct > 70 ? 'bg-warning' : 'bg-primary'
                        )}
                        style={{ width: `${clamped}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{tc('limitLabel')} <Money value={limitVal} className="text-xs" /></span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    {card.closingDate && <span>{t('cards.closesOn')} <span className="font-medium text-foreground n">{card.closingDate}</span></span>}
                    {card.dueDate && <span>{t('cards.dueOn')} <span className="font-medium text-foreground n">{card.dueDate}</span></span>}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    {onViewDetail && (
                      <Button variant="outline" size="sm" onClick={() => onViewDetail(card)} className="flex-1 text-xs">
                        {tc('seeAll')}
                      </Button>
                    )}
                    {onAddExpense && (
                      <Button variant="secondary" size="sm" onClick={() => onAddExpense(card)} className="flex-1 text-xs">
                        {t('dialogs.cardDetail.addExpense')}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SectionState>
    </div>
  )
}
