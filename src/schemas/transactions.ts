import { z } from "zod";

export const createTransactionSchema = z.object({
    amount: z.number(),
    date: z.string(), // Could add regex for YYYY-MM-DD
    category: z.string().min(1),
    note: z.string().optional(),
    bank: z.string().min(1),
    account: z.string().min(1),
    currency: z.string().default("₮"),
});

export const updateTransactionSchema = z.object({
    amount: z.number().optional(),
    date: z.string().optional(),
    category: z.string().optional(),
    note: z.string().optional(),
    bank: z.string().optional(),
    account: z.string().optional(),
    currency: z.string().optional(),
});
