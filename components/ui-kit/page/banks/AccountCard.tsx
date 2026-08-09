import { Money } from '@/components/ui-kit/money/Money'
import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'
import type { MoneyView } from '@/lib/format'
import { cn } from '@/lib/utils'

export interface AccountCardAccount {
  id: string
  name: string
  bank: string
  cbu?: string
  alias?: string
  currency: string
  balance: MoneyView
  lastImportAt?: string
}

export interface AccountCardProps {
  account: AccountCardAccount
  onClick?: () => void
  className?: string
}

export function AccountCard({ account, onClick, className }: AccountCardProps) {
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
          <p className="font-semibold text-foreground">{account.name}</p>
          <p className="text-xs text-muted-foreground">{account.bank}</p>
        </div>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {account.currency}
        </span>
      </div>

      <Money value={account.balance} className="text-2xl font-bold" />

      {account.cbu && (
        <p className="text-xs text-muted-foreground font-mono truncate">{account.cbu}</p>
      )}

      {account.lastImportAt && (
        <FreshnessStamp observedAt={account.lastImportAt} />
      )}
    </div>
  )
}
