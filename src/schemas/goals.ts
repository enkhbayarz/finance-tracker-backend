import { z } from "zod";

export const createGoalSchema = z.object({
    name: z.string().min(1, "Name is required"),
    target_amount: z.number().positive(),
    current_amount: z.number().default(0),
    currency: z.string().default("₮"),
});

export const updateGoalSchema = z.object({
    name: z.string().optional(),
    target_amount: z.number().optional(),
    current_amount: z.number().optional(),
    is_active: z.number().int().min(0).max(1).optional(),
});
