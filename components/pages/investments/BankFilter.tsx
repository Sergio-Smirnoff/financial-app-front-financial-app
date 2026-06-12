'use client'

import { useBanks } from '@/lib/hooks/useBanks'

interface BankFilterProps {
  value: string | null
  onChange: (bankNumber: string | null) => void
}

export function BankFilter({ value, onChange }: BankFilterProps) {
  const { banks } = useBanks()
  return (
    <div className="flex gap-2 flex-wrap items-center mb-4">
      <span className="text-xs font-bold text-muted-foreground">Account:</span>
      <button
        onClick={() => onChange(null)}
        className={`text-xs font-bold px-3 py-1.5 rounded-full border ${value === null ? 'border-primary bg-primary/10' : 'border-border bg-muted'}`}
      >All banks</button>
      {banks.map((bank) => (
        <button
          key={bank.bankNumber}
          onClick={() => onChange(bank.bankNumber)}
          className={`text-xs font-bold px-3 py-1.5 rounded-full border ${value === bank.bankNumber ? 'border-primary bg-primary/10' : 'border-border bg-muted'}`}
        >{bank.name}</button>
      ))}
    </div>
  )
}
