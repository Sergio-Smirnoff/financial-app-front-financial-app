import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(100),
  type: z.enum(["CHECKING", "SAVINGS", "INVESTMENT"]),
  balance: z.number({ error: "Must be a number" }),
  currency: z.string().min(1, "Currency is required"),
});

export type AccountFormValues = z.infer<typeof accountSchema>;
