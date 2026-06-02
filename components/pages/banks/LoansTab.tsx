'use client'

import { useState } from 'react'
import { useBanks } from '@/lib/hooks/useBanks'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { LoanList } from './LoanList'

export function LoansTab() {
  const { banks } = useBanks()
  const [filterBank, setFilterBank] = useState<string>('ALL')

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterBank} onValueChange={setFilterBank}>
          <SelectTrigger className="w-[180px] h-9 rounded-xl border-border bg-background text-xs font-bold text-muted-foreground">
            <SelectValue placeholder="Bank" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="ALL">All Banks</SelectItem>
            {banks.map((b) => <SelectItem key={b.bankNumber} value={b.bankNumber}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <LoanList bankNumber={filterBank === 'ALL' ? undefined : filterBank} />

      <ConfirmDialog />
    </div>
  )
}
