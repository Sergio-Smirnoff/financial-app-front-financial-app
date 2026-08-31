'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'
import type { components } from '@/lib/api/bff/schema'

export type ImportRunRowResponse = components['schemas']['ImportRunRowResponse']

const STATUS_KEYS: Record<string, string> = {
  PENDING: 'history.status.PENDING',
  COMPLETED: 'history.status.COMPLETED',
  PARTIAL: 'history.status.PARTIAL',
  FAILED: 'history.status.FAILED',
  UNDONE: 'history.status.UNDONE',
}

export interface ImportHistoryTableProps {
  rows: ImportRunRowResponse[]
  onUndo?: (runId: number) => Promise<void>
}

export function ImportHistoryTable({ rows, onUndo }: ImportHistoryTableProps) {
  const t = useTranslations('imports')
  const tc = useTranslations('common')
  const [selectedUndo, setSelectedUndo] = useState<ImportRunRowResponse | null>(null)
  const [undoError, setUndoError] = useState<string | null>(null)

  const handleConfirmUndo = async () => {
    if (!selectedUndo || selectedUndo.runId === undefined) return
    try {
      setUndoError(null)
      await onUndo?.(selectedUndo.runId)
      setSelectedUndo(null)
    } catch {
      setUndoError(t('history.undoBlocked'))
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="section-head">{t('history.title')}</h3>

      {undoError && (
        <div role="alert" className="p-3 rounded-lg bg-destructive/10 border border-destructive text-destructive text-sm font-medium">
          {undoError}
        </div>
      )}

      <div className="w-full overflow-auto">
        <table aria-label={t('history.tableLabel')} className="w-full border-collapse text-sm">
          <caption className="sr-only">{t('history.tableLabel')}</caption>
          <thead>
            <tr className="border-b text-left text-xs font-medium text-muted-foreground">
              <th scope="col" className="px-3 py-2">{tc('file')}</th>
              <th scope="col" className="px-3 py-2">{t('history.colSourceCbu')}</th>
              <th scope="col" className="px-3 py-2 text-right">{t('history.colInserted')}</th>
              <th scope="col" className="px-3 py-2 text-right">{t('history.colDuplicates')}</th>
              <th scope="col" className="px-3 py-2 text-right">{t('history.colFailed')}</th>
              <th scope="col" className="px-3 py-2">{t('history.colDate')}</th>
              <th scope="col" className="px-3 py-2">{t('history.colStatus')}</th>
              <th scope="col" className="px-3 py-2">{t('history.colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-center text-xs text-muted-foreground">
                  {t('history.empty')}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={row.runId ?? idx}
                  data-testid="import-run-row"
                  className="border-b transition-colors hover:bg-muted/30"
                >
                  <td className="px-3 py-2 font-medium">{row.fileName || '—'}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.accountCbu || '—'}</td>
                  <td className="px-3 py-2 text-right">{row.inserted ?? 0}</td>
                  <td className="px-3 py-2 text-right">{row.duplicates ?? 0}</td>
                  <td className="px-3 py-2 text-right">{row.failed ?? 0}</td>
                  <td className="px-3 py-2">
                    {row.importedAt ? <FreshnessStamp observedAt={row.importedAt} /> : '—'}
                  </td>
                  <td className="px-3 py-2">
                    {row.status ? (STATUS_KEYS[row.status] ? t(STATUS_KEYS[row.status]) : row.status) : '—'}
                  </td>
                  <td className="px-3 py-2">
                    {row.runId !== undefined && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUndo(row)}
                      >
                        {t('history.undo')}
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog open={selectedUndo !== null} onOpenChange={(o) => !o && setSelectedUndo(null)}>
        <AlertDialogContent aria-describedby="undo-dialog-desc">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('history.undoTitle')}</AlertDialogTitle>
            <AlertDialogDescription id="undo-dialog-desc">
              {t('history.undoDescription', {
                fileName: selectedUndo?.fileName ?? '',
                count: selectedUndo?.inserted ?? 0,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="text-sm font-medium py-2">
            {t('history.undoCount', { count: selectedUndo?.inserted ?? 0 })}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUndo(null)}>{tc('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUndo}>
              {t('history.undoConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
