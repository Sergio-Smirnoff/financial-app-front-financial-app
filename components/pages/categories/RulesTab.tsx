'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
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
import type { components } from '@/lib/api/bff/schema'
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'

export type RuleRowResponse = components['schemas']['RuleRowResponse']

export interface RulesTabProps {
  section?: Section<RuleRowResponse[]>
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
  const t = useTranslations('categories')
  const [newRuleOpen, setNewRuleOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const columns: ColumnDef<RuleRowResponse, unknown>[] = [
    {
      id: 'matcher',
      accessorKey: 'matcher',
      header: t('rules.matches'),
    },
    {
      id: 'categoryName',
      accessorKey: 'categoryName',
      header: t('rules.assigned'),
    },
    {
      id: 'priority',
      accessorFn: (row) => row.priority ?? 0,
      header: t('rules.priority'),
    },
    {
      id: 'actions',
      accessorFn: (row) => row,
      header: t('rules.actionsHeader'),
      cell: ({ getValue }) => {
        const row = getValue() as RuleRowResponse
        return (
          <div data-row className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                if (row.id != null) setDeleteId(row.id)
              }}
            >
              {t('rules.actionsHeader')}
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
            <h3 className="section-head">{t('rulesTitle')}</h3>
            <Button size="sm" onClick={() => setNewRuleOpen(true)}>
              {t('rules.new')}
            </Button>
          </div>

          <DataTable columns={columns} rows={rules} caption={t('rules.caption')} />

          <RuleFormDialog
            open={newRuleOpen}
            onOpenChange={setNewRuleOpen}
            categories={categories}
            onCommit={onAddRule}
          />

          <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
            <AlertDialogContent aria-describedby="delete-rule-desc">
              <AlertDialogHeader>
                <AlertDialogTitle>{t('rules.deleteTitle')}</AlertDialogTitle>
                <AlertDialogDescription id="delete-rule-desc">
                  {t('rules.deleteDescription')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteId(null)}>{t('rules.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    if (deleteId !== null) {
                      await onDeleteRule?.(deleteId)
                      setDeleteId(null)
                    }
                  }}
                >
                  {t('rules.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </SectionState>
  )
}
