import { z } from "zod";

export const bankSchema = z.object({
  name: z.string().min(1, "Bank name is required").max(100),
  logoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export type BankFormValues = z.infer<typeof bankSchema>;
