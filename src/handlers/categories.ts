import { Env } from "../types";
import { json } from "../utils/response";
import { createCategorySchema, updateCategorySchema } from "../schemas/categories";

export async function getCategories(req: Request, env: Env) {
    const user = (req as any).user;
    const cacheKey = `categories:${user.sub}`;

    const cached = await env.KV.get(cacheKey);
    if (cached) return json(JSON.parse(cached));

    const { results } = await env.DB.prepare(
        "SELECT * FROM categories WHERE user_id = ? ORDER BY name"
    ).bind(user.sub).all();

    await env.KV.put(cacheKey, JSON.stringify(results), { expirationTtl: 3600 });

    return json(results);
}

export async function createCategory(req: Request, env: Env) {
    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
        return json({ error: parsed.error.format() }, 400);
    }

    const { name, icon, color, budget_amount } = parsed.data;
    const user = (req as any).user;

    const result = await env.DB.prepare(
        "INSERT INTO categories (name, icon, color, budget_amount, user_id, email) VALUES (?, ?, ?, ?, ?, ?)"
    )
        .bind(name, icon ?? null, color ?? null, budget_amount, user.sub, user.email ?? null)
        .run();

    await env.KV.delete(`categories:${user.sub}`);

    return json(
        {
            id: result.meta.last_row_id,
            name,
            icon,
            color,
            budget_amount,
        },
        201
    );
}

export async function updateCategory(req: Request, env: Env, params: Record<string, string>) {
    const body = await req.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
        return json({ error: parsed.error.format() }, 400);
    }

    const { name, icon, color, budget_amount } = parsed.data;

    // Ideally we should check if record exists first, but for now we follow existing logic
    // Optimizing SQL update to only update fields that are present would be complex with standard D1 prepare.
    // The original code used COALESCE(?, name), so we should do the same.
    const user = (req as any).user;

    await env.DB.prepare(
        "UPDATE categories SET name = COALESCE(?, name), icon = COALESCE(?, icon), color = COALESCE(?, color), budget_amount = COALESCE(?, budget_amount) WHERE id = ? AND user_id = ?"
    )
        .bind(
            name ?? null,
            icon ?? null,
            color ?? null,
            budget_amount ?? null,
            params.id,
            user.sub
        )
        .run();

    await env.KV.delete(`categories:${user.sub}`);

    return json({ id: params.id, name, icon, color, budget_amount });
}
