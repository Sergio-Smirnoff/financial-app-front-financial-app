'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateCardExpense } from '@/lib/hooks/useCards'
import { cardExpenseSchema, CardExpenseFormValues } from '@/lib/schemas/cardExpense'
import { toast } from 'sonner'

interface Props { cardNumber: string; open: boolean; onOpenChange: (o: boolean) => void }

export function CardExpenseDialog({ cardNumber, open, onOpenChange }: Props) {
  const mutation = useCreateCardExpense(cardNumber)

  const form = useForm<CardExpenseFormValues>({
    resolver: zodResolver(cardExpenseSchema),
    defaultValues: {
      description: '',
      totalAmount: 0,
      currency: 'USD',
      totalInstallments: 1,
      firstDueDate: '',
    },
  })

  const onFormSubmit = async (values: CardExpenseFormValues) => {
    try {
      await mutation.mutateAsync({
        description: values.description,
        totalAmount: String(values.totalAmount),
        currency: values.currency,
        totalInstallments: values.totalInstallments,
        firstDueDate: values.firstDueDate,
      })
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save card expense')
    }
  }

  const isPending = mutation.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) form.reset(); onOpenChange(v) }}>
      <DialogContent className="bg-popover border-border">
        <DialogHeader>
          <DialogTitle>New card expense</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Description</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Total amount</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        className="bg-background border-border"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Currency</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="ARS">ARS</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="totalInstallments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Installments</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        className="bg-background border-border"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstDueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">First due date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
