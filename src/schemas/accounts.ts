import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bank_id: z.number().int().positive(),
  account_type: z.string().min(1),
  balance: z.number().default(0),
  currency: z.string().default("₮"),
});

export const updateAccountSchema = z.object({
  balance: z.number(),
});
