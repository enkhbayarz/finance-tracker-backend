import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().optional(),
  color: z.string().optional(),
  budget_amount: z.number().default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  budget_amount: z.number().optional(),
});
