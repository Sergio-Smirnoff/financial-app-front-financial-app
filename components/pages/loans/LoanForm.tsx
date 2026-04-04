'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateLoan } from '@/lib/hooks/useLoans'
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
  entity: z.string().optional(),
  totalAmount: z.number({ error: 'Required' }).positive('Must be positive'),
  currency: z.string().min(1, 'Required'),
  totalInstallments: z.number({ error: 'Required' }).int().min(1, 'Min 1'),
  installmentAmount: z.number({ error: 'Required' }).positive('Must be positive'),
  firstPaymentDate: z.string().min(1, 'Required'),
})

type FormValues = z.infer<typeof schema>

export function LoanForm({ onSuccess }: { onSuccess: () => void }) {
  const createLoan = useCreateLoan()

  const form = useForm<FormValues, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: '',
      entity: '',
      totalAmount: undefined,
      currency: 'USD',
      totalInstallments: 12,
      installmentAmount: undefined,
      firstPaymentDate: new Date().toISOString().slice(0, 10),
    },
  })

  const onSubmit = (values: FormValues) => {
    createLoan.mutate(values, {
      onSuccess: () => { toast.success('Loan created'); onSuccess() },
      onError: () => toast.error('Failed to create loan'),
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
              <FormControl><Input {...field} placeholder="e.g. Car loan" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="entity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entity / bank (optional)</FormLabel>
              <FormControl><Input {...field} placeholder="e.g. Banco Nacional" /></FormControl>
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

        <FormField
          control={form.control}
          name="firstPaymentDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First payment date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={createLoan.isPending}>
          {createLoan.isPending ? 'Creating…' : 'Create loan'}
        </Button>
      </form>
    </Form>
  )
}
