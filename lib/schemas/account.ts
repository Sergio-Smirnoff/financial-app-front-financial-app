import { z } from "zod";
import { cbuCheckDigitError } from "@/lib/utils/cbu";

export const accountSchema = z
  .object({
    bankNumber: z.string().regex(/^\d{3}$/, "Select a bank"),
    name: z.string().min(1, "Account name is required").max(100),
    type: z.enum(["CHECKING", "SAVINGS"]),
    currency: z.string().min(1, "Currency is required"),
    cbu: z.string().regex(/^\d{22}$/, "CBU must be exactly 22 digits"),
    alias: z.string().max(100).optional().or(z.literal("")),
  })
  .refine((v) => v.cbu.slice(0, 3) === v.bankNumber, {
    message: "CBU's first 3 digits must match the selected bank's code",
    path: ["cbu"],
  })
  .superRefine((v, ctx) => {
    const error = cbuCheckDigitError(v.cbu);
    if (error) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: error, path: ["cbu"] });
    }
  });

export type AccountFormValues = z.infer<typeof accountSchema>;
