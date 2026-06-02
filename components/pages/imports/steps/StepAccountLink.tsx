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
  bankNumber: string | null
  accountCbu: string | null
  cardNumber: string | null
  usdAccountCbu: string | null
  onBankChange: (v: string | null) => void
  onAccountChange: (v: string | null) => void
  onCardChange: (v: string | null) => void
  onUsdAccountChange: (v: string | null) => void
  onNext: () => void
  onBack: () => void
}

export function StepAccountLink({
  fileType, currencyCounts,
  bankNumber, accountCbu, cardNumber, usdAccountCbu,
  onBankChange, onAccountChange, onCardChange, onUsdAccountChange,
  onNext, onBack,
}: Props) {
  const { banks } = useBanks()
  const { data: cards = [] } = useCards(bankNumber ?? undefined)

  const selectedBank = banks.find(b => b.bankNumber === bankNumber)
  const accounts = selectedBank?.accounts ?? []
  const arsAccounts = accounts.filter(a => a.currency === 'ARS' && a.isActive)
  const usdAccounts = accounts.filter(a => a.currency === 'USD' && a.isActive)

  useEffect(() => {
    onAccountChange(null)
    onCardChange(null)
    onUsdAccountChange(null)
  }, [bankNumber])

  const isVisa = fileType === 'VISA_PDF'
  const hasUsd = (currencyCounts?.USD ?? 0) > 0
  const canProceed = isVisa ? (cardNumber !== null && accountCbu !== null) : accountCbu !== null

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Bank <span className="text-destructive">*</span></Label>
          <Select
            value={bankNumber ?? ''}
            onValueChange={(v) => onBankChange(v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select bank…" />
            </SelectTrigger>
            <SelectContent>
              {banks.map(b => (
                <SelectItem key={b.bankNumber} value={b.bankNumber}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isVisa ? (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs">Card <span className="text-destructive">*</span></Label>
              <Select
                value={cardNumber ?? ''}
                onValueChange={(v) => onCardChange(v)}
                disabled={!bankNumber}
              >
                <SelectTrigger>
                  <SelectValue placeholder={bankNumber ? 'Select card…' : 'Select a bank first'} />
                </SelectTrigger>
                <SelectContent>
                  {cards.map(c => (
                    <SelectItem key={c.cardNumber} value={c.cardNumber}>
                      {c.displayName} ···{c.cardNumber.slice(-4)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">ARS Account <span className="text-destructive">*</span></Label>
              <Select
                value={accountCbu ?? ''}
                onValueChange={(v) => onAccountChange(v)}
                disabled={!bankNumber}
              >
                <SelectTrigger>
                  <SelectValue placeholder={bankNumber ? 'Select ARS account…' : 'Select a bank first'} />
                </SelectTrigger>
                <SelectContent>
                  {arsAccounts.map(a => (
                    <SelectItem key={a.cbu} value={a.cbu}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasUsd && (
              <div className="space-y-1.5">
                <Label className="text-xs">USD Account</Label>
                <Select
                  value={usdAccountCbu ?? ''}
                  onValueChange={(v) => onUsdAccountChange(v ? v : null)}
                  disabled={!bankNumber}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select USD account (optional)…" />
                  </SelectTrigger>
                  <SelectContent>
                    {usdAccounts.map(a => (
                      <SelectItem key={a.cbu} value={a.cbu}>{a.name}</SelectItem>
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
              value={accountCbu ?? ''}
              onValueChange={(v) => onAccountChange(v)}
              disabled={!bankNumber}
            >
              <SelectTrigger>
                <SelectValue placeholder={bankNumber ? 'Select account…' : 'Select a bank first'} />
              </SelectTrigger>
              <SelectContent>
                {accounts.filter(a => a.isActive).map(a => (
                  <SelectItem key={a.cbu} value={a.cbu}>
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
