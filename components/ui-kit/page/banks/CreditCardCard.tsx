import { useTranslations } from 'next-intl'
import { Money } from '@/components/ui-kit/money/Money'
import type { MoneyView } from '@/lib/format'
import { cn } from '@/lib/utils'

export interface CreditCardCardData {
  id: string
  name: string
  bank: string
  lastFour: string
  currency: string
  balance: MoneyView
  creditLimit: MoneyView
  closingDay: number
  dueDay: number
}

export interface CreditCardCardProps {
  card: CreditCardCardData
  onClick?: () => void
  className?: string
}

export function CreditCardCard({ card, onClick, className }: CreditCardCardProps) {
  const t = useTranslations('common')
  const used = Number(card.balance.amount)
  const limit = Number(card.creditLimit.amount)
  const usagePct = limit > 0 ? Math.round((used / limit) * 100) : 0
  const clamped = Math.min(usagePct, 100)

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
      className={cn(
        'rounded-xl border bg-card p-5 flex flex-col gap-3 shadow-sm transition-shadow',
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">{card.name}</p>
          <p className="text-xs text-muted-foreground">
            {card.bank} •••• {card.lastFour}
          </p>
        </div>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {card.currency}
        </span>
      </div>

      {/* Balance (amount owed) */}
      <Money value={card.balance} className="text-2xl font-bold" />

      {/* Limit usage progressbar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t('used')}</span>
          <span className="n">{t('percentOfLimit', { pct: usagePct })}</span>
        </div>
        <div
          role="progressbar"
          aria-label={t('creditLimitUsage')}
          aria-valuenow={usagePct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
        >
          <div
            className={cn(
              'h-full rounded-full transition-all',
              usagePct > 90 ? 'bg-destructive' : usagePct > 70 ? 'bg-warning' : 'bg-primary'
            )}
            style={{ width: `${clamped}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t('limitLabel')} <Money value={card.creditLimit} className="text-xs" /></span>
        </div>
      </div>

      {/* Closing and due cycle */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>
          {t.rich('closesOnDay', {
            day: card.closingDay,
            hl: (chunks) => <span className="font-medium text-foreground n">{chunks}</span>,
          })}
        </span>
        <span>
          {t.rich('dueOnDay', {
            day: card.dueDay,
            hl: (chunks) => <span className="font-medium text-foreground n">{chunks}</span>,
          })}
        </span>
      </div>
    </div>
  )
}
