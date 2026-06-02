import { z } from "zod";

export const cardSchema = z.object({
  bankNumber: z.string().regex(/^\d{3}$/, 'Select a bank'),
  brand: z.enum(['VISA', 'MASTERCARD', 'AMEX']),
  cardType: z.enum(['STANDARD', 'SILVER', 'GOLD', 'BLACK', 'PLATINUM']),
  behavior: z.enum(['INSTANT_PAYMENT', 'INSTALLMENTS']),
  cardNumber: z.string().regex(/^\d{16}$/, 'Must be 16 digits'),
  expiringDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Format MM/YY'),
  closingDay: z.number().int().min(1).max(31),
  dueDay: z.number().int().min(1).max(31),
});

export type CardFormValues = z.infer<typeof cardSchema>;
