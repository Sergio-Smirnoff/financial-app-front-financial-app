'use client'

import { useImportHistory } from '@/lib/hooks/useImport'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { ImportStatus } from '@/types/import'

const FILE_TYPE_LABELS: Record<string, string> = {
  VISA_PDF: 'Visa PDF',
  BANK_PDF: 'Bank PDF',
  CSV: 'CSV',
}

const STATUS_VARIANT: Record<ImportStatus, 'default' | 'secondary' | 'destructive'> = {
  COMPLETED: 'default',
  PARTIAL: 'secondary',
  FAILED: 'destructive',
}

export function ImportHistory() {
  const { data: records, isLoading } = useImportHistory()

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Import History</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-0">
        {isLoading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading…</p>
        ) : !records?.length ? (
          <p className="p-4 text-sm text-muted-foreground">No imports yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="max-w-[140px] truncate text-xs" title={r.originalName}>
                    {r.originalName}
                  </TableCell>
                  <TableCell className="text-xs">{FILE_TYPE_LABELS[r.fileType] ?? r.fileType}</TableCell>
                  <TableCell className="text-right text-xs">{r.importedCount}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    {format(new Date(r.createdAt), 'dd/MM/yy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[r.importStatus] ?? 'secondary'} className="text-xs">
                      {r.importStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
