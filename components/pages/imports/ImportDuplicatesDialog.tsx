'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useResolveDuplicates } from '@/lib/hooks/useImport'
import { DuplicateItem } from '@/types/import'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  duplicates: DuplicateItem[]
  sessionId: string
  onResolved: () => void
}

export function ImportDuplicatesDialog({ open, onOpenChange, duplicates, sessionId, onResolved }: Props) {
  const t = useTranslations('imports')
  const tc = useTranslations('common')
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const resolve = useResolveDuplicates()

  const toggle = (id: string) =>
    setChecked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleResolve = async (keepIds: string[]) => {
    try {
      await resolve.mutateAsync({ sessionId, keepIds })
      onOpenChange(false)
      onResolved()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('wizard.duplicates.toastResolveFailed'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('wizard.duplicates.title')}</DialogTitle>
          <DialogDescription className="sr-only">{t('wizard.duplicates.srDescription')}</DialogDescription>
          <p className="text-sm text-muted-foreground">
            {t('wizard.duplicates.body', { count: duplicates.length })}
          </p>
        </DialogHeader>

        <div className="max-h-80 overflow-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>{t('wizard.cols.date')}</TableHead>
                <TableHead>{t('wizard.cols.description')}</TableHead>
                <TableHead className="text-right">{tc('amount')}</TableHead>
                <TableHead>{t('wizard.cols.currency')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {duplicates.map((d) => (
                <TableRow key={d.id} className="cursor-pointer" onClick={() => toggle(d.id)}>
                  <TableCell>
                    <Checkbox
                      checked={checked.has(d.id)}
                      onCheckedChange={() => toggle(d.id)}
                    />
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    {format(new Date(d.date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="text-xs max-w-[240px] truncate">{d.description}</TableCell>
                  <TableCell className="text-right text-xs font-medium">
                    {d.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-xs">{d.currency}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleResolve([])}>
            {t('wizard.duplicates.skipAll')}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleResolve(Array.from(checked))}
            disabled={checked.size === 0 || resolve.isPending}
          >
            {t('wizard.duplicates.importChecked', { count: checked.size })}
          </Button>
          <Button
            onClick={() => handleResolve(duplicates.map(d => d.id))}
            disabled={resolve.isPending}
          >
            {t('wizard.duplicates.importAll')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
