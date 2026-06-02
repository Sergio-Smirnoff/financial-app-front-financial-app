'use client'

import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateLoan } from '@/lib/hooks/useLoans'
import { useBanks } from '@/lib/hooks/useBanks'
import { useMemo } from 'react'
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
  bankNumber: z.string().regex(/^\d{3}$/, 'Required'),
  destinationAccountCbu: z.string().regex(/^\d{22}$/, 'Required'),
  name: z.string().min(1, 'Required'),
  principal: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Non-negative amount'),
  interestRate: z.string().regex(/^\d+(\.\d+)?$/, 'Non-negative rate'),
  totalInstallments: z.number().int().min(1, 'Min 1'),
  startDate: z.string().min(1, 'Required'),
})

type FormValues = z.infer<typeof schema>

export function LoanForm({ bankNumber, onSuccess }: { bankNumber?: string, onSuccess: () => void }) {
  const { banks } = useBanks()
  const createLoan = useCreateLoan()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      bankNumber: bankNumber ?? '',
      destinationAccountCbu: '',
      name: '',
      principal: '',
      interestRate: '0',
      totalInstallments: 12,
      startDate: new Date().toISOString().slice(0, 10),
    },
  })

  const selectedBankNumber = form.watch('bankNumber')

  const availableAccounts = useMemo(() => {
    const bank = banks.find((b) => b.bankNumber === selectedBankNumber)
    return bank?.accounts.filter((a) => a.type !== 'INVESTMENT') ?? []
  }, [banks, selectedBankNumber])

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    createLoan.mutate(values, {
      onSuccess: () => { toast.success('Loan created'); onSuccess() },
      onError: (e) => { toast.error(e.message || 'Failed to create loan') },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!bankNumber && (
          <FormField
            control={form.control}
            name="bankNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank</FormLabel>
                <Select value={field.value} onValueChange={(v) => { field.onChange(v); form.setValue('destinationAccountCbu', '') }}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select Bank" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {banks.map((b) => (
                      <SelectItem key={b.bankNumber} value={b.bankNumber}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="destinationAccountCbu"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deposit to Account</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedBankNumber}
              >
                <FormControl><SelectTrigger><SelectValue placeholder={selectedBankNumber ? 'Select destination account' : 'Select bank first'} /></SelectTrigger></FormControl>
                <SelectContent>
                  {availableAccounts.map((a) => (
                    <SelectItem key={a.cbu} value={a.cbu}>
                      {a.name} ({a.currency})
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
                  <Input {...field} inputMode="decimal" placeholder="0.00" />
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
                  <Input {...field} inputMode="decimal" placeholder="0" />
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
                    {...form.register('totalInstallments', { valueAsNumber: true })}
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
