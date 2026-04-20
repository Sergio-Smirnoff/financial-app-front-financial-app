'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateTransaction } from '@/lib/hooks/useTransactions'
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
import { useCategories } from '@/lib/hooks/useCategories'
import { useMemo, useEffect, useState } from 'react'

const schema = z.object({
  accountId: z.number().min(1),
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive('Must be positive'),
  currency: z.string().min(1),
  categoryId: z.number().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required').max(255),
  date: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

interface QuickTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  accountId: number
  currency: string
  type: 'INCOME' | 'EXPENSE'
}

export function QuickTransactionDialog({ 
  open, 
  onOpenChange, 
  onSuccess, 
  accountId, 
  currency, 
  type 
}: QuickTransactionDialogProps) {
  const createMutation = useCreateTransaction()
  const { data: categories } = useCategories()

  const [parentCategoryId, setParentCategoryId] = useState<number | undefined>(undefined)

  const filteredCategories = useMemo(() => {
    return categories?.filter(c => c.type === type || c.type === 'BOTH') || []
  }, [categories, type])

  const subcategories = useMemo(() => {
    if (!parentCategoryId || !categories) return []
    return categories.find((c) => c.id === parentCategoryId)?.subcategories
      ?.filter(s => s.type === type || s.type === 'BOTH') ?? []
  }, [parentCategoryId, categories, type])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      accountId,
      currency,
      type,
      amount: undefined,
      categoryId: undefined,
      description: '',
      date: new Date().toISOString().slice(0, 10),
    }
  })

  useEffect(() => {
    if (open) {
        setParentCategoryId(undefined);
        form.reset({
            accountId,
            currency,
            type,
            amount: undefined,
            categoryId: undefined,
            description: '',
            date: new Date().toISOString().slice(0, 10),
        });
    }
  }, [open, accountId, currency, type, form]);

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success(type === 'INCOME' ? 'Deposit recorded' : 'Withdrawal recorded')
        onSuccess()
        onOpenChange(false)
        form.reset()
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to record transaction')
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{type === 'INCOME' ? 'Deposit Funds' : 'Withdraw Funds'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Input value={currency} disabled />
              </FormItem>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  value={parentCategoryId?.toString() ?? ''}
                  onValueChange={(v) => {
                    setParentCategoryId(v ? Number(v) : undefined)
                    form.setValue('categoryId', undefined as any)
                  }}
                >
                  <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {filteredCategories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <Select 
                      onValueChange={(v) => field.onChange(Number(v))} 
                      value={field.value?.toString() ?? ''}
                      disabled={!parentCategoryId}
                    >
                      <FormControl><SelectTrigger><SelectValue placeholder={parentCategoryId ? 'Select subcategory' : 'Select a category first'} /></SelectTrigger></FormControl>
                      <SelectContent className="max-h-[300px]">
                        {subcategories.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Input {...field} placeholder="Reason..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Processing…' : 'Record'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
