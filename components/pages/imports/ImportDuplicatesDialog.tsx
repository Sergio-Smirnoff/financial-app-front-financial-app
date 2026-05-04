'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useResolveDuplicates } from '@/lib/hooks/useImport'
import { DuplicateItem } from '@/types/import'
import { format } from 'date-fns'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  duplicates: DuplicateItem[]
  sessionId: string
  onResolved: () => void
}

export function ImportDuplicatesDialog({ open, onOpenChange, duplicates, sessionId, onResolved }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const resolve = useResolveDuplicates()

  const toggle = (id: string) =>
    setChecked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleResolve = async (keepIds: string[]) => {
    await resolve.mutateAsync({ sessionId, keepIds })
    onOpenChange(false)
    onResolved()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Possible duplicates found</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {duplicates.length} transaction{duplicates.length !== 1 ? 's' : ''} already exist with the same date and amount. Select which ones to import anyway.
          </p>
        </DialogHeader>

        <div className="max-h-80 overflow-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Currency</TableHead>
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
            Skip all
          </Button>
          <Button
            variant="outline"
            onClick={() => handleResolve(Array.from(checked))}
            disabled={checked.size === 0 || resolve.isPending}
          >
            Import checked ({checked.size})
          </Button>
          <Button
            onClick={() => handleResolve(duplicates.map(d => d.id))}
            disabled={resolve.isPending}
          >
            Import all
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
