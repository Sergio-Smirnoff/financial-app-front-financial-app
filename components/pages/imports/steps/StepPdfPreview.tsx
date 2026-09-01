'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ParsedRow, CurrencyCounts, ImportFileType } from '@/types/import'
import { format } from 'date-fns'

const TYPE_KEYS: Record<string, string> = {
  INCOME: 'steps.pdfPreview.type.INCOME',
  EXPENSE: 'steps.pdfPreview.type.EXPENSE',
}

interface Props {
  preview: ParsedRow[]
  totalCount: number
  currencyCounts: CurrencyCounts
  fileType: ImportFileType
  onNext: () => void
  onBack: () => void
}

export function StepPdfPreview({ preview, totalCount, currencyCounts, fileType, onNext, onBack }: Props) {
  const t = useTranslations('imports')
  const tc = useTranslations('common')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {t.rich('steps.pdfPreview.summary', {
            count: totalCount,
            shown: preview.length,
            strong: (chunks) => <span className="font-medium text-foreground">{chunks}</span>,
          })}
        </p>
        {fileType === 'VISA_PDF' && (
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">{t('steps.pdfPreview.arsCount', { count: currencyCounts.ARS })}</Badge>
            <Badge variant="outline" className="text-xs">{t('steps.pdfPreview.usdCount', { count: currencyCounts.USD })}</Badge>
            {currencyCounts.skipped > 0 && (
              <Badge variant="secondary" className="text-xs">{t('steps.pdfPreview.skippedCount', { count: currencyCounts.skipped })}</Badge>
            )}
          </div>
        )}
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('wizard.cols.date')}</TableHead>
              <TableHead>{t('wizard.cols.description')}</TableHead>
              <TableHead className="text-right">{tc('amount')}</TableHead>
              <TableHead>{t('wizard.cols.currency')}</TableHead>
              <TableHead>{t('steps.pdfPreview.colType')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="text-xs whitespace-nowrap">
                  {format(new Date(row.date), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell className="text-xs max-w-[280px] truncate" title={row.description}>
                  {row.description}
                </TableCell>
                <TableCell className="text-right text-xs font-medium">
                  {row.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-xs">{row.currency}</TableCell>
                <TableCell>
                  <Badge
                    variant={row.type === 'INCOME' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {TYPE_KEYS[row.type] ? t(TYPE_KEYS[row.type]) : row.type}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>{t('wizard.back')}</Button>
        <Button onClick={onNext}>{t('wizard.next')}</Button>
      </div>
    </div>
  )
}
