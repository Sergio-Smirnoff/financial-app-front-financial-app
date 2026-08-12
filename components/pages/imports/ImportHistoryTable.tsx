'use client'

import React, { useState } from 'react'
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

export interface ImportHistoryTableProps {
  rows: ImportRunRowResponse[]
  onUndo?: (runId: number) => Promise<void>
}

export function ImportHistoryTable({ rows, onUndo }: ImportHistoryTableProps) {
  const [selectedUndo, setSelectedUndo] = useState<ImportRunRowResponse | null>(null)
  const [undoError, setUndoError] = useState<string | null>(null)

  const handleConfirmUndo = async () => {
    if (!selectedUndo || selectedUndo.runId === undefined) return
    try {
      setUndoError(null)
      await onUndo?.(selectedUndo.runId)
      setSelectedUndo(null)
    } catch {
      setUndoError('Hay movimientos editados manualmente')
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="section-head">Historial de Importaciones</h3>

      {undoError && (
        <div role="alert" className="p-3 rounded-lg bg-destructive/10 border border-destructive text-destructive text-sm font-medium">
          {undoError}
        </div>
      )}

      <div className="w-full overflow-auto">
        <table aria-label="Historial de archivos importados" className="w-full border-collapse text-sm">
          <caption className="sr-only">Historial de archivos importados</caption>
          <thead>
            <tr className="border-b text-left text-xs font-medium text-muted-foreground">
              <th scope="col" className="px-3 py-2">Archivo</th>
              <th scope="col" className="px-3 py-2">Origen / CBU</th>
              <th scope="col" className="px-3 py-2 text-right">Insertados</th>
              <th scope="col" className="px-3 py-2 text-right">Duplicados</th>
              <th scope="col" className="px-3 py-2 text-right">Fallidos</th>
              <th scope="col" className="px-3 py-2">Fecha</th>
              <th scope="col" className="px-3 py-2">Estado</th>
              <th scope="col" className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-center text-xs text-muted-foreground">
                  No hay historial de importaciones
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
                  <td className="px-3 py-2">{row.status || '—'}</td>
                  <td className="px-3 py-2">
                    {row.runId !== undefined && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUndo(row)}
                      >
                        Deshacer
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
            <AlertDialogTitle>¿Deshacer importación?</AlertDialogTitle>
            <AlertDialogDescription id="undo-dialog-desc">
              Se eliminarán los movimientos importados de {selectedUndo?.fileName} ({selectedUndo?.inserted ?? 0} movimientos).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="text-sm font-medium py-2">
            {selectedUndo?.inserted ?? 0} movimientos serán removidos.
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
  )
}
