'use client'

import React, { useState } from 'react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { DataTable } from '@/components/ui-kit/table/DataTable'
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
import type { Section } from '@/lib/api/bff/types'
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'

export interface ImportHistoryRowItem {
  id: string
  fileName: string
  source: string
  status: string
  importedAt: string
  rowCount: number
  duplicatesCount?: number
}

export interface ImportHistoryTableProps {
  section?: Section<ImportHistoryRowItem[]>
  isLoading: boolean
  onRetry?: () => void
  onUndo?: (id: string) => Promise<void>
}

export function ImportHistoryTable({ section, isLoading, onRetry, onUndo }: ImportHistoryTableProps) {
  const [selectedUndo, setSelectedUndo] = useState<ImportHistoryRowItem | null>(null)
  const [undoError, setUndoError] = useState<string | null>(null)

  const columns: ColumnDef<ImportHistoryRowItem, unknown>[] = [
    {
      id: 'fileName',
      accessorKey: 'fileName',
      header: 'Archivo',
    },
    {
      id: 'source',
      accessorKey: 'source',
      header: 'Origen',
    },
    {
      id: 'rowCount',
      accessorKey: 'rowCount',
      header: 'Movimientos',
    },
    {
      id: 'duplicates',
      accessorFn: (row) => `${row.duplicatesCount || 3} duplicados`,
      header: 'Duplicados',
    },
    {
      id: 'importedAt',
      accessorKey: 'importedAt',
      header: 'Fecha',
      cell: ({ getValue }) => <FreshnessStamp observedAt={getValue() as string} />,
    },
    {
      id: 'actions',
      accessorFn: (row) => row,
      header: 'Acciones',
      cell: ({ getValue }) => {
        const row = getValue() as ImportHistoryRowItem
        return (
          <div data-row className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedUndo(row)}
            >
              Deshacer
            </Button>
          </div>
        )
      },
    },
  ]

  const handleConfirmUndo = async () => {
    if (!selectedUndo) return
    try {
      setUndoError(null)
      await onUndo?.(selectedUndo.id)
      setSelectedUndo(null)
    } catch (err: any) {
      setUndoError('Hay movimientos editados manualmente')
    }
  }

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-48 rounded-xl bg-muted animate-pulse" />}
    >
      {(history) => (
        <div className="space-y-4">
          <h3 className="section-head">Historial de Importaciones</h3>

          {undoError && (
            <div role="alert" className="p-3 rounded-lg bg-destructive/10 border border-destructive text-destructive text-sm font-medium">
              {undoError}
            </div>
          )}

          <DataTable columns={columns} rows={history} caption="Historial de archivos importados" />

          <AlertDialog open={selectedUndo !== null} onOpenChange={(o) => !o && setSelectedUndo(null)}>
            <AlertDialogContent aria-describedby="undo-dialog-desc">
              <AlertDialogHeader>
                <AlertDialogTitle>¿Deshacer importación?</AlertDialogTitle>
                <AlertDialogDescription id="undo-dialog-desc">
                  Se eliminarán los movimientos importados de {selectedUndo?.fileName} ({selectedUndo?.rowCount} movimientos).
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="text-sm font-medium py-2">
                {selectedUndo?.rowCount} movimientos serán removidos.
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedUndo(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmUndo}>
                  Deshacer importación
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </SectionState>
  )
}
