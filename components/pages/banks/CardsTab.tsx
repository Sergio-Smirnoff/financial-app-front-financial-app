'use client'

import React from 'react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { CreditCardCard } from '@/components/ui-kit/page/banks/CreditCardCard'
import { Button } from '@/components/ui/button'
import type { Section, CreditCardRow } from '@/lib/api/bff/types'

export interface CardsTabProps {
  section?: Section<CreditCardRow[]>
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
      skeleton={<div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => (<div key={i} className="h-44 rounded-xl bg-muted animate-pulse" />))}</div>}
    >
      {(cards) => (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <CreditCardCard
              key={card.id}
              card={{
                id: String(card.id),
                name: card.cardName,
                bankName: 'Banco',
                lastFourDigits: card.lastFour,
                currentBalance: card.balance,
                creditLimit: { amount: '500000', currency: card.balance.currency, secondary: null },
                closingDate: card.closingDate,
                dueDate: card.dueDate,
              }}
            />
          ))}
        </div>
      )}
    </SectionState>
  )
}
