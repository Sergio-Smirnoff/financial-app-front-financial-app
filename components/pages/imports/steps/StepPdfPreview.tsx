'use client'

import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ParsedRow, CurrencyCounts, ImportFileType } from '@/types/import'
import { format } from 'date-fns'

interface Props {
  preview: ParsedRow[]
  totalCount: number
  currencyCounts: CurrencyCounts
  fileType: ImportFileType
  onNext: () => void
  onBack: () => void
}

export function StepPdfPreview({ preview, totalCount, currencyCounts, fileType, onNext, onBack }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">
          Found <span className="font-medium text-foreground">{totalCount}</span> transactions.
          Showing first {preview.length}.
        </p>
        {fileType === 'VISA_PDF' && (
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">ARS: {currencyCounts.ARS}</Badge>
            <Badge variant="outline" className="text-xs">USD: {currencyCounts.USD}</Badge>
            {currencyCounts.skipped > 0 && (
              <Badge variant="secondary" className="text-xs">Skipped: {currencyCounts.skipped}</Badge>
            )}
          </div>
        )}
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Type</TableHead>
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
                    {row.type}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  )
}
