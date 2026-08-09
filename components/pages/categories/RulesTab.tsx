'use client'

import React, { useState } from 'react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { DataTable } from '@/components/ui-kit/table/DataTable'
import { Button } from '@/components/ui/button'
import { RuleFormDialog } from './RuleFormDialog'
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
import type { Section } from '@/lib/api/bff/types'
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'

export interface CategorizationRuleItem {
  id: number
  pattern: string
  categoryName: string
  matchCount: number
}

export interface RulesTabProps {
  section?: Section<CategorizationRuleItem[]>
  isLoading: boolean
  onRetry?: () => void
  categories?: { id: number; name: string }[]
  onAddRule?: (pattern: string, categoryId: number) => Promise<void>
  onDeleteRule?: (id: number) => Promise<void>
}

export function RulesTab({
  section,
  isLoading,
  onRetry,
  categories = [],
  onAddRule,
  onDeleteRule,
}: RulesTabProps) {
  const [newRuleOpen, setNewRuleOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const columns: ColumnDef<CategorizationRuleItem, unknown>[] = [
    {
      id: 'pattern',
      accessorKey: 'pattern',
      header: 'Coincide con',
    },
    {
      id: 'categoryName',
      accessorKey: 'categoryName',
      header: 'Categoría asignada',
    },
    {
      id: 'matchCount',
      accessorFn: (row) => `${row.matchCount} coincidencias`,
      header: 'Coincidencias',
    },
    {
      id: 'actions',
      accessorFn: (row) => row,
      header: 'Acciones',
      cell: ({ getValue }) => {
        const row = getValue() as CategorizationRuleItem
        return (
          <div data-row className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setDeleteId(row.id)
              }}
            >
              Acciones
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-48 rounded-xl bg-muted animate-pulse" />}
    >
      {(rules) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="section-head">Reglas Automáticas</h3>
            <Button size="sm" onClick={() => setNewRuleOpen(true)}>
              Nueva regla
            </Button>
          </div>

          <DataTable columns={columns} rows={rules} caption="Reglas de categorización" />

          <RuleFormDialog
            open={newRuleOpen}
            onOpenChange={setNewRuleOpen}
            categories={categories}
            onCommit={onAddRule}
          />

          <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
            <AlertDialogContent aria-describedby="delete-rule-desc">
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar regla?</AlertDialogTitle>
                <AlertDialogDescription id="delete-rule-desc">
                  Esta acción eliminará la regla de categorización. Las transacciones pasadas mantendrán su categoría actual.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    if (deleteId !== null) {
                      await onDeleteRule?.(deleteId)
                      setDeleteId(null)
                    }
                  }}
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </SectionState>
  )
}
