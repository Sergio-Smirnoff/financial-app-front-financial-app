'use client'

import { useBanks } from '@/lib/hooks/useBanks'
import { cn } from '@/lib/utils'

interface BankFilterProps {
  value: string | null
  onChange: (bankNumber: string | null) => void
}

const pillBase =
  'text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'

const pillActive =
  'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30 ring-inset'

const pillInactive =
  'border-border bg-muted text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5'

export function BankFilter({ value, onChange }: BankFilterProps) {
  const { banks } = useBanks()
  return (
    <div className="flex gap-2 flex-wrap items-center mb-4">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Account
      </span>
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(pillBase, value === null ? pillActive : pillInactive)}
      >
        All banks
      </button>
      {banks.map((bank) => (
        <button
          type="button"
          key={bank.bankNumber}
          onClick={() => onChange(bank.bankNumber)}
          className={cn(pillBase, value === bank.bankNumber ? pillActive : pillInactive)}
        >
          {bank.name}
        </button>
      ))}
    </div>
  )
}
