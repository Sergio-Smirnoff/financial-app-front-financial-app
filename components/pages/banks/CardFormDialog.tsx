'use client'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateCard } from '@/lib/hooks/useCards'
import type { CardBehavior, CardBrand, CardType } from '@/types/cards'

const schema = z.object({
  brand: z.enum(['VISA', 'MASTERCARD', 'AMEX']),
  cardType: z.enum(['STANDARD', 'SILVER', 'GOLD', 'BLACK', 'PLATINUM']),
  behavior: z.enum(['INSTANT_PAYMENT', 'INSTALLMENTS']),
  last4Digits: z.string().regex(/^\d{4}$/, 'Must be 4 digits'),
  expiringDate: z.string().min(1, 'Required'),
  closingDay: z.number().int().min(1).max(28),
  dueDay: z.number().int().min(1).max(28),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: number
}

export function CardFormDialog({ open, onOpenChange, accountId }: Props) {
  const mutation = useCreateCard()
  const { register, handleSubmit, formState, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      brand: 'VISA',
      cardType: 'STANDARD',
      behavior: 'INSTANT_PAYMENT',
      last4Digits: '',
      expiringDate: '',
      closingDay: 20,
      dueDay: 10,
    },
  })

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    await mutation.mutateAsync({ accountId, ...values })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent>
        <DialogHeader><DialogTitle>New Card</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Brand</Label>
              <Select defaultValue="VISA" onValueChange={(v) => setValue('brand', v as CardBrand)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="VISA">Visa</SelectItem>
                  <SelectItem value="MASTERCARD">Mastercard</SelectItem>
                  <SelectItem value="AMEX">Amex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select defaultValue="STANDARD" onValueChange={(v) => setValue('cardType', v as CardType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                  <SelectItem value="SILVER">Silver</SelectItem>
                  <SelectItem value="GOLD">Gold</SelectItem>
                  <SelectItem value="BLACK">Black</SelectItem>
                  <SelectItem value="PLATINUM">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Behavior</Label>
              <Select defaultValue="INSTANT_PAYMENT" onValueChange={(v) => setValue('behavior', v as CardBehavior)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INSTANT_PAYMENT">Instant payment</SelectItem>
                  <SelectItem value="INSTALLMENTS">Installments</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="last4Digits">Last 4 digits</Label>
              <Input id="last4Digits" inputMode="numeric" maxLength={4} {...register('last4Digits')} />
              {formState.errors.last4Digits && <p className="mt-1 text-xs text-destructive">{formState.errors.last4Digits.message}</p>}
            </div>
            <div>
              <Label htmlFor="expiringDate">Expiring date</Label>
              <Input id="expiringDate" type="date" {...register('expiringDate')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="closingDay">Closing day</Label>
              <Input id="closingDay" type="number" min={1} max={28} {...register('closingDay', { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="dueDay">Due day</Label>
              <Input id="dueDay" type="number" min={1} max={28} {...register('dueDay', { valueAsNumber: true })} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
