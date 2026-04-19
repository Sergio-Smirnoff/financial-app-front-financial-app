'use client'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useCreateCardExpense } from '@/lib/hooks/useCards'

const schema = z.object({
  description: z.string().min(1).max(255),
  totalAmount: z.number().positive(),
  currency: z.enum(['ARS', 'USD']),
  totalInstallments: z.number().int().min(1),
  firstDueDate: z.string().min(1),
})
type FormValues = z.infer<typeof schema>

interface Props { cardId: number; open: boolean; onOpenChange: (o: boolean) => void }

export function CardExpenseDialog({ cardId, open, onOpenChange }: Props) {
  const mutation = useCreateCardExpense(cardId)
  const { register, handleSubmit, formState, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { description: '', totalAmount: 0, currency: 'USD', totalInstallments: 1, firstDueDate: '' },
  })

  const onSubmit: SubmitHandler<FormValues> = async (v) => {
    await mutation.mutateAsync(v)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent>
        <DialogHeader><DialogTitle>New card expense</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="totalAmount">Total amount</Label>
              <Input id="totalAmount" type="number" step="0.01" {...register('totalAmount', { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <select id="currency" className="h-9 w-full rounded-md border bg-background px-3 text-sm" {...register('currency')}>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="totalInstallments">Installments</Label>
              <Input id="totalInstallments" type="number" min={1} {...register('totalInstallments', { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="firstDueDate">First due date</Label>
              <Input id="firstDueDate" type="date" {...register('firstDueDate')} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending || !formState.isValid}>
              {mutation.isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
