'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateLoan } from '@/lib/hooks/useLoans'
import { useBanks } from '@/lib/hooks/useBanks'
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

const schema = z.object({
  accountId: z.coerce.number({ error: 'Required' }).positive('Required'),
  name: z.string().min(1, 'Required'),
  principal: z.number({ error: 'Required' }).positive('Must be positive'),
  interestRate: z.number({ error: 'Required' }).min(0, 'Min 0'),
  totalInstallments: z.number({ error: 'Required' }).int().min(1, 'Min 1'),
  startDate: z.string().min(1, 'Required'),
})

type FormValues = z.infer<typeof schema>

export function LoanForm({ onSuccess }: { onSuccess: () => void }) {
  const { banks } = useBanks()
  const createLoan = useCreateLoan()

  const form = useForm<FormValues, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      accountId: undefined,
      name: '',
      principal: undefined,
      interestRate: 0,
      totalInstallments: 12,
      startDate: new Date().toISOString().slice(0, 10),
    },
  })

  const onSubmit = (values: FormValues) => {
    createLoan.mutate(values, {
      onSuccess: () => { toast.success('Loan created'); onSuccess() },
      onError: () => toast.error('Failed to create loan'),
    })
  }

  const allAccounts = banks.flatMap(b => b.accounts.map(a => ({ ...a, bankName: b.name })))

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(parseInt(v))}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger></FormControl>
                <SelectContent>
                  {allAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>
                      {a.bankName} - {a.name} ({a.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loan Name</FormLabel>
              <FormControl><Input {...field} placeholder="e.g. Car loan" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="principal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Principal Amount</FormLabel>
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
            name="interestRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interest Rate (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.valueAsNumber ?? 0)}
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
            name="totalInstallments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Installments</FormLabel>
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
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={createLoan.isPending}>
          {createLoan.isPending ? 'Creating…' : 'Create loan'}
        </Button>
      </form>
    </Form>
  )
}
