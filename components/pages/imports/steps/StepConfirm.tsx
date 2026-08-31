'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ImportFileType, CurrencyCounts } from '@/types/import'
import { BankResponse } from '@/types/banks'
import { Card as CardType } from '@/types/cards'

interface AccountSummary { id: number; name: string; currency: string }

interface Props {
  file: File
  fileType: ImportFileType
  bank: BankResponse | undefined
  account: AccountSummary | undefined
  card: CardType | undefined
  usdAccount: AccountSummary | undefined
  totalCount: number
  currencyCounts?: CurrencyCounts
  isLoading: boolean
  onConfirm: () => void
  onBack: () => void
}

const FILE_TYPE_LABEL_KEYS: Record<ImportFileType, string> = {
  VISA_PDF: 'steps.fileTypes.VISA_PDF',
  BANK_PDF: 'steps.fileTypes.BANK_PDF',
  CSV: 'steps.fileTypes.CSV',
}

export function StepConfirm({
  file, fileType, bank, account, card, usdAccount,
  totalCount, currencyCounts, isLoading, onConfirm, onBack,
}: Props) {
  const t = useTranslations('imports')
  const tc = useTranslations('common')

  const rows: { label: string; value: string }[] = [
    { label: tc('file'), value: file.name },
    { label: t('steps.confirm.type'), value: t(FILE_TYPE_LABEL_KEYS[fileType]) },
    { label: t('steps.confirm.bank'), value: bank?.name ?? '—' },
  ]

  if (fileType === 'VISA_PDF') {
    rows.push(
      { label: t('steps.confirm.card'), value: card ? `${card.displayName} ···${card.cardNumber.slice(-4)}` : '—' },
      { label: t('steps.confirm.arsAccount'), value: account?.name ?? '—' },
    )
    if (usdAccount) rows.push({ label: t('steps.confirm.usdAccount'), value: usdAccount.name })
  } else {
    rows.push({ label: t('steps.confirm.account'), value: account ? `${account.name} (${account.currency})` : '—' })
  }

  rows.push({ label: t('steps.confirm.transactionsToImport'), value: String(totalCount) })

  if (currencyCounts && fileType === 'VISA_PDF') {
    rows.push(
      { label: 'ARS', value: String(currencyCounts.ARS) },
      { label: 'USD', value: String(currencyCounts.USD) },
    )
    if (currencyCounts.skipped > 0)
      rows.push({ label: t('steps.confirm.skippedUnsupported'), value: String(currencyCounts.skipped) })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-4 space-y-0">
          {rows.map(({ label, value }, i) => (
            <div key={i}>
              {i > 0 && <Separator className="my-2" />}
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-xs font-medium text-right max-w-[60%] truncate">{value}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>{t('wizard.back')}</Button>
        <Button onClick={onConfirm} disabled={isLoading}>
          {isLoading ? t('steps.confirm.importing') : t('steps.confirm.confirm')}
        </Button>
      </div>
    </div>
  )
}
