import { z } from "zod";

export const cardExpenseSchema = z.object({
  description: z.string().min(1, 'Required').max(255),
  totalAmount: z.number({ error: 'Required' }).positive('Must be positive'),
  currency: z.enum(['ARS', 'USD']),
  totalInstallments: z.number({ error: 'Required' }).int().min(1, 'Min 1 installment'),
  firstDueDate: z.string().min(1, 'Required'),
});

export type CardExpenseFormValues = z.infer<typeof cardExpenseSchema>;
