'use client'

import { useEffect } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useBanks } from '@/lib/hooks/useBanks'
import { useCards } from '@/lib/hooks/useCards'
import { ImportFileType, CurrencyCounts } from '@/types/import'

interface Props {
  fileType: ImportFileType
  currencyCounts?: CurrencyCounts
  bankId: number | null
  accountId: number | null
  cardId: number | null
  usdAccountId: number | null
  onBankChange: (id: number | null) => void
  onAccountChange: (id: number | null) => void
  onCardChange: (id: number | null) => void
  onUsdAccountChange: (id: number | null) => void
  onNext: () => void
  onBack: () => void
}

export function StepAccountLink({
  fileType, currencyCounts,
  bankId, accountId, cardId, usdAccountId,
  onBankChange, onAccountChange, onCardChange, onUsdAccountChange,
  onNext, onBack,
}: Props) {
  const { banks } = useBanks()
  const { data: cards = [] } = useCards(bankId ?? undefined)

  const selectedBank = banks.find(b => b.id === bankId)
  const accounts = selectedBank?.accounts ?? []
  const arsAccounts = accounts.filter(a => a.currency === 'ARS' && a.isActive)
  const usdAccounts = accounts.filter(a => a.currency === 'USD' && a.isActive)

  useEffect(() => {
    onAccountChange(null)
    onCardChange(null)
    onUsdAccountChange(null)
  }, [bankId])

  const isVisa = fileType === 'VISA_PDF'
  const hasUsd = (currencyCounts?.USD ?? 0) > 0
  const canProceed = isVisa ? (cardId !== null && accountId !== null) : accountId !== null

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Bank <span className="text-destructive">*</span></Label>
          <Select
            value={bankId?.toString() ?? ''}
            onValueChange={(v) => onBankChange(Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select bank…" />
            </SelectTrigger>
            <SelectContent>
              {banks.map(b => (
                <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isVisa ? (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs">Card <span className="text-destructive">*</span></Label>
              <Select
                value={cardId?.toString() ?? ''}
                onValueChange={(v) => onCardChange(Number(v))}
                disabled={!bankId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={bankId ? 'Select card…' : 'Select a bank first'} />
                </SelectTrigger>
                <SelectContent>
                  {(cards as any[]).map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.displayName} ···{c.last4Digits}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">ARS Account <span className="text-destructive">*</span></Label>
              <Select
                value={accountId?.toString() ?? ''}
                onValueChange={(v) => onAccountChange(Number(v))}
                disabled={!bankId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={bankId ? 'Select ARS account…' : 'Select a bank first'} />
                </SelectTrigger>
                <SelectContent>
                  {arsAccounts.map(a => (
                    <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasUsd && (
              <div className="space-y-1.5">
                <Label className="text-xs">USD Account</Label>
                <Select
                  value={usdAccountId?.toString() ?? ''}
                  onValueChange={(v) => onUsdAccountChange(v ? Number(v) : null)}
                  disabled={!bankId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select USD account (optional)…" />
                  </SelectTrigger>
                  <SelectContent>
                    {usdAccounts.map(a => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {currencyCounts?.USD} USD transaction{currencyCounts?.USD !== 1 ? 's' : ''} found.
                  If no account selected, they will be skipped.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-1.5">
            <Label className="text-xs">Account <span className="text-destructive">*</span></Label>
            <Select
              value={accountId?.toString() ?? ''}
              onValueChange={(v) => onAccountChange(Number(v))}
              disabled={!bankId}
            >
              <SelectTrigger>
                <SelectValue placeholder={bankId ? 'Select account…' : 'Select a bank first'} />
              </SelectTrigger>
              <SelectContent>
                {accounts.filter(a => a.isActive).map(a => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {a.name} ({a.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext} disabled={!canProceed}>Next</Button>
      </div>
    </div>
  )
}
