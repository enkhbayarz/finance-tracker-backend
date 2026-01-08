import { Env } from "../types";
import { json } from "../utils/response";
import { createGoalSchema, updateGoalSchema } from "../schemas/goals";

export async function getGoals(req: Request, env: Env) {
    const user = (req as any).user;
    const { results } = await env.DB.prepare(
        "SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC"
    ).bind(user.sub).all();
    return json(results);
}

export async function getActiveGoal(req: Request, env: Env) {
    const user = (req as any).user;
    const result = await env.DB.prepare(
        "SELECT * FROM goals WHERE is_active = 1 AND user_id = ? LIMIT 1"
    ).bind(user.sub).first();
    return result ? json(result) : json({ error: "No active goal" }, 404);
}

export async function createGoal(req: Request, env: Env) {
    const body = await req.json();
    const parsed = createGoalSchema.safeParse(body);

    if (!parsed.success) {
        return json({ error: parsed.error.format() }, 400);
    }

    const { name, target_amount, current_amount, currency } = parsed.data;
    const user = (req as any).user;

    const result = await env.DB.prepare(
        "INSERT INTO goals (name, target_amount, current_amount, currency, user_id, email) VALUES (?, ?, ?, ?, ?, ?)"
    )
        .bind(name, target_amount, current_amount, currency, user.sub, user.email ?? null)
        .run();

    return json(
        {
            id: result.meta.last_row_id,
            name,
            target_amount,
            current_amount,
            currency,
        },
        201
    );
}

export async function updateGoal(req: Request, env: Env, params: Record<string, string>) {
    const body = await req.json();
    const parsed = updateGoalSchema.safeParse(body);

    if (!parsed.success) {
        return json({ error: parsed.error.format() }, 400);
    }

    const { name, target_amount, current_amount, is_active } = parsed.data;

    const user = (req as any).user;
    await env.DB.prepare(
        `
    UPDATE goals SET 
      name = COALESCE(?, name), target_amount = COALESCE(?, target_amount),
      current_amount = COALESCE(?, current_amount), is_active = COALESCE(?, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `
    )
        .bind(
            name ?? null,
            target_amount ?? null,
            current_amount ?? null,
            is_active ?? null,
            params.id,
            user.sub
        )
        .run();

    return json({
        id: params.id,
        name,
        target_amount,
        current_amount,
        is_active,
    });
}
