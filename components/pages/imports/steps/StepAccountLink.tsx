'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('imports')
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
          <Label className="text-xs">{t('steps.accountLink.bank')} <span className="text-destructive">*</span></Label>
          <Select
            value={bankNumber ?? ''}
            onValueChange={(v) => onBankChange(v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('steps.accountLink.selectBank')} />
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
              <Label className="text-xs">{t('steps.accountLink.card')} <span className="text-destructive">*</span></Label>
              <Select
                value={cardNumber ?? ''}
                onValueChange={(v) => onCardChange(v)}
                disabled={!bankNumber}
              >
                <SelectTrigger>
                  <SelectValue placeholder={bankNumber ? t('steps.accountLink.selectCard') : t('steps.accountLink.selectBankFirst')} />
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
              <Label className="text-xs">{t('steps.accountLink.arsAccount')} <span className="text-destructive">*</span></Label>
              <Select
                value={accountCbu ?? ''}
                onValueChange={(v) => onAccountChange(v)}
                disabled={!bankNumber}
              >
                <SelectTrigger>
                  <SelectValue placeholder={bankNumber ? t('steps.accountLink.selectArsAccount') : t('steps.accountLink.selectBankFirst')} />
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
                <Label className="text-xs">{t('steps.accountLink.usdAccount')}</Label>
                <Select
                  value={usdAccountCbu ?? ''}
                  onValueChange={(v) => onUsdAccountChange(v ? v : null)}
                  disabled={!bankNumber}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('steps.accountLink.selectUsdAccount')} />
                  </SelectTrigger>
                  <SelectContent>
                    {usdAccounts.map(a => (
                      <SelectItem key={a.cbu} value={a.cbu}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t('steps.accountLink.usdHint', { count: currencyCounts?.USD ?? 0 })}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-1.5">
            <Label className="text-xs">{t('steps.accountLink.account')} <span className="text-destructive">*</span></Label>
            <Select
              value={accountCbu ?? ''}
              onValueChange={(v) => onAccountChange(v)}
              disabled={!bankNumber}
            >
              <SelectTrigger>
                <SelectValue placeholder={bankNumber ? t('steps.accountLink.selectAccount') : t('steps.accountLink.selectBankFirst')} />
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
        <Button variant="outline" onClick={onBack}>{t('wizard.back')}</Button>
        <Button onClick={onNext} disabled={!canProceed}>{t('wizard.next')}</Button>
      </div>
    </div>
  )
}
