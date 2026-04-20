'use client'

import { useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTransfer } from '@/lib/hooks/useTransactions'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { CURRENCIES } from '@/lib/utils/currency'

const schema = z.object({
  fromAccountId: z.number().min(1, 'Required'),
  toAccountId: z.number().min(1, 'Required'),
  amount: z.number().positive('Must be positive'),
  currency: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
  description: z.string().optional(),
}).refine(data => data.fromAccountId !== data.toAccountId, {
  message: "Source and destination accounts must be different",
  path: ["toAccountId"],
})

type FormValues = z.infer<typeof schema>

interface TransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  defaultFromAccountId?: number | null
}

export function TransferDialog({ open, onOpenChange, onSuccess, defaultFromAccountId }: TransferDialogProps) {
  const transferMutation = useTransfer()
  const { banks } = useBanks()

  const allAccounts = useMemo(() => {
    return banks?.flatMap(bank => bank.accounts.map(acc => ({ ...acc, bankName: bank.name }))) ?? []
  }, [banks])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fromAccountId: defaultFromAccountId ?? 0,
      toAccountId: 0,
      amount: undefined,
      currency: 'USD',
      date: new Date().toISOString().slice(0, 10),
      description: 'Transfer between accounts',
    },
  })

  useEffect(() => {
    if (open && defaultFromAccountId) {
      form.setValue('fromAccountId', defaultFromAccountId);
      const acc = allAccounts.find(a => a.id === defaultFromAccountId);
      if (acc) form.setValue('currency', acc.currency);
    }
  }, [open, defaultFromAccountId, allAccounts, form]);

  const onSubmit = (values: FormValues) => {
    transferMutation.mutate(values, {
      onSuccess: () => {
        toast.success('Transfer completed')
        onSuccess()
        onOpenChange(false)
        form.reset()
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to complete transfer')
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer funds</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fromAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Account</FormLabel>
                  <Select 
                    onValueChange={(v) => {
                        const val = Number(v);
                        field.onChange(val);
                        const acc = allAccounts.find(a => a.id === val);
                        if (acc) form.setValue('currency', acc.currency);
                    }} 
                    value={field.value > 0 ? field.value.toString() : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allAccounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id.toString()}>
                          {acc.bankName} - {acc.name} ({acc.currency})
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
              name="toAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Account</FormLabel>
                  <Select 
                    onValueChange={(v) => field.onChange(Number(v))} 
                    value={field.value > 0 ? field.value.toString() : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allAccounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id.toString()}>
                          {acc.bankName} - {acc.name} ({acc.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...form.register('amount', { valueAsNumber: true })}
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
                    <Select value={field.value} onValueChange={field.onChange} disabled>
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

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={transferMutation.isPending}>
              {transferMutation.isPending ? 'Processing…' : 'Transfer'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
