'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateCardExpense } from '@/lib/hooks/useCardExpenses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { toast } from 'sonner'
import { CURRENCIES } from '@/lib/utils/currency'

const schema = z.object({
  description: z.string().min(1, 'Required'),
  totalAmount: z.number({ error: 'Required' }).positive('Must be positive'),
  currency: z.string().min(1, 'Required'),
  totalInstallments: z.number({ error: 'Required' }).int().min(1, 'Min 1'),
  installmentAmount: z.number({ error: 'Required' }).positive('Must be positive'),
  cardId: z.number({ error: 'Required' }).int().min(1, 'Required'),
  nextDueDate: z.string().min(1, 'Required'),
})

type FormValues = z.infer<typeof schema>

export function CardExpenseForm({ onSuccess }: { onSuccess: () => void }) {
  const createExpense = useCreateCardExpense()

  const form = useForm<FormValues, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: '',
      totalAmount: undefined,
      currency: 'USD',
      totalInstallments: 1,
      installmentAmount: undefined,
      cardId: 1,
      nextDueDate: new Date().toISOString().slice(0, 10),
    },
  })

  const onSubmit = (values: FormValues) => {
    createExpense.mutate(values, {
      onSuccess: () => { toast.success('Card expense created'); onSuccess() },
      onError: () => toast.error('Failed to create card expense'),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Input {...field} placeholder="e.g. New laptop" /></FormControl>
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
                <FormLabel>Total amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
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
                <FormLabel>Currency</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
                <FormLabel>Installments</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="installmentAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount / installment</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="cardId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card ID</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nextDueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First due date</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={createExpense.isPending}>
          {createExpense.isPending ? 'Creating…' : 'Create card expense'}
        </Button>
      </form>
    </Form>
  )
}
