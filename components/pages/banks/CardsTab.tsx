'use client'

import React from 'react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { Money } from '@/components/ui-kit/money/Money'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Section, CardRow } from '@/lib/api/bff/types'

export interface CardsTabProps {
  section?: Section<CardRow[]>
  isLoading: boolean
  onRetry?: () => void
  onAddCard?: () => void
}

export function CardsTab({ section, isLoading, onRetry, onAddCard }: CardsTabProps) {
  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      emptyAction={
        onAddCard ? (
          <Button size="sm" onClick={onAddCard}>
            Agregar tarjeta
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
            const cardName = card.alias || `${card.brand || 'Tarjeta'} •••• ${lastFour}`
            const cardUsed = card.used || { amount: '0', currency: 'ARS', secondary: null }
            const limitVal = { amount: String(card.limit ?? 0), currency: cardUsed.currency, secondary: null }

            return (
              <div key={card.cardNumber || card.alias || card.brand} className="rounded-xl border bg-card p-5 flex flex-col gap-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{cardName}</p>
                    <p className="text-xs text-muted-foreground">{card.brand || 'Tarjeta'} •••• {lastFour}</p>
                  </div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{cardUsed.currency}</span>
                </div>
                <Money value={cardUsed} className="text-2xl font-bold" />
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Usado</span>
                    <span className="n">{usedPct} % de Límite</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label="Uso del límite de crédito"
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
                    <span>Límite: <Money value={limitVal} className="text-xs" /></span>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  {card.closingDate && <span>Cierra: <span className="font-medium text-foreground n">{card.closingDate}</span></span>}
                  {card.dueDate && <span>Vence: <span className="font-medium text-foreground n">{card.dueDate}</span></span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </SectionState>
  )
}
