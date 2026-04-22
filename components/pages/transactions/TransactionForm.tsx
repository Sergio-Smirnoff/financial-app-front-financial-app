'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateTransaction, useUpdateTransaction } from '@/lib/hooks/useTransactions'
import { useCategories } from '@/lib/hooks/useCategories'
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
import type { Transaction } from '@/types/finances'

const schema = z.object({
  description: z.string().min(1, 'Required'),
  amount: z.number({ error: 'Required' }).positive('Must be positive'),
  type: z.enum(['INCOME', 'EXPENSE']),
  currency: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
  categoryId: z.number().optional(),
})

type FormValues = z.infer<typeof schema>

interface TransactionFormProps {
  defaultValues?: Partial<Transaction>
  onSuccess: () => void
}

export function TransactionForm({ defaultValues, onSuccess }: TransactionFormProps) {
  const isEditing = !!defaultValues?.id
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const { data: categories } = useCategories()

  const initialParentId = useMemo(() => {
    if (!defaultValues?.categoryId || !categories) return undefined
    return categories.find((c) =>
      c.subcategories?.some((sub) => sub.id === defaultValues.categoryId)
    )?.id
  }, [defaultValues?.categoryId, categories])

  const [parentCategoryId, setParentCategoryId] = useState<number | undefined>(initialParentId)

  const subcategories = useMemo(() => {
    if (!parentCategoryId || !categories) return []
    return categories.find((c) => c.id === parentCategoryId)?.subcategories ?? []
  }, [parentCategoryId, categories])

  const form = useForm<FormValues, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: defaultValues?.description ?? '',
      amount: defaultValues?.amount ?? undefined,
      type: defaultValues?.type ?? 'EXPENSE',
      currency: defaultValues?.currency ?? 'USD',
      date: defaultValues?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      categoryId: defaultValues?.categoryId ?? undefined,
    },
  })

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      categoryId: values.categoryId ?? 0,
    }

    if (isEditing) {
      updateMutation.mutate(
        { id: defaultValues.id!, data: payload },
        {
          onSuccess: () => { toast.success('Transaction updated'); onSuccess() },
          onError: () => toast.error('Failed to update transaction'),
        },
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => { toast.success('Transaction created'); onSuccess() },
        onError: () => toast.error('Failed to create transaction'),
      })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">Description</FormLabel>
              <FormControl><Input {...field} placeholder="e.g. Grocery shopping" className="bg-background border-border" /></FormControl>
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
                <FormLabel className="text-muted-foreground">Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                    className="bg-background border-border"
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
                  <FormControl><SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent className="bg-popover border-border">
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground">Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground">Date</FormLabel>
                <FormControl><Input type="date" {...field} className="bg-background border-border" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {categories && categories.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <FormItem>
              <FormLabel className="text-muted-foreground">Category</FormLabel>
              <Select
                value={parentCategoryId?.toString() ?? ''}
                onValueChange={(v) => {
                  setParentCategoryId(v ? Number(v) : undefined)
                  form.setValue('categoryId', undefined)
                }}
              >
                <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {categories.map((c) => (
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
                  <FormLabel className="text-muted-foreground">Subcategory</FormLabel>
                  <Select
                    value={field.value?.toString() ?? ''}
                    onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
                    disabled={!parentCategoryId}
                  >
                    <FormControl><SelectTrigger className="bg-background border-border"><SelectValue placeholder={parentCategoryId ? 'Select subcategory' : 'Select a category first'} /></SelectTrigger></FormControl>
                    <SelectContent className="bg-popover border-border">
                      {subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={String(sub.id)}>{sub.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Saving…' : isEditing ? 'Update' : 'Create'}
        </Button>
      </form>
    </Form>
  )
}
