'use client'

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

const FILE_TYPE_LABELS: Record<ImportFileType, string> = {
  VISA_PDF: 'ICBC Visa Statement',
  BANK_PDF: 'ICBC Bank Movements',
  CSV: 'Generic CSV',
}

export function StepConfirm({
  file, fileType, bank, account, card, usdAccount,
  totalCount, currencyCounts, isLoading, onConfirm, onBack,
}: Props) {
  const rows: { label: string; value: string }[] = [
    { label: 'File', value: file.name },
    { label: 'Type', value: FILE_TYPE_LABELS[fileType] },
    { label: 'Bank', value: bank?.name ?? '—' },
  ]

  if (fileType === 'VISA_PDF') {
    rows.push(
      { label: 'Card', value: card ? `${card.displayName} ···${card.last4Digits}` : '—' },
      { label: 'ARS Account', value: account?.name ?? '—' },
    )
    if (usdAccount) rows.push({ label: 'USD Account', value: usdAccount.name })
  } else {
    rows.push({ label: 'Account', value: account ? `${account.name} (${account.currency})` : '—' })
  }

  rows.push({ label: 'Transactions to import', value: String(totalCount) })

  if (currencyCounts && fileType === 'VISA_PDF') {
    rows.push(
      { label: 'ARS', value: String(currencyCounts.ARS) },
      { label: 'USD', value: String(currencyCounts.USD) },
    )
    if (currencyCounts.skipped > 0)
      rows.push({ label: 'Skipped (unsupported currency)', value: String(currencyCounts.skipped) })
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
        <Button variant="outline" onClick={onBack} disabled={isLoading}>Back</Button>
        <Button onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'Importing…' : 'Import →'}
        </Button>
      </div>
    </div>
  )
}
