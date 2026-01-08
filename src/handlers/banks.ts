import { AuthenticatedRequest, Env } from "../types";
import { json } from "../utils/response";
import { createBankSchema } from "../schemas/banks";

export async function getBanks(req: Request, env: Env) {
  const user = (req as AuthenticatedRequest).user;
  if (!user) return json({ error: "Unauthorized" }, 401);

  const cacheKey = `banks:${user.sub}`;

  // 1. Try KV
  const cached = await env.KV.get(cacheKey);
  if (cached) {
    return json(JSON.parse(cached));
  }

  // 2. Fetch DB
  const { results } = await env.DB.prepare(
    "SELECT * FROM banks WHERE user_id = ? ORDER BY name"
  )
    .bind(user.sub)
    .all();

  // 3. Save to KV (TTL 1 hour)
  await env.KV.put(cacheKey, JSON.stringify(results), { expirationTtl: 3600 });

  return json(results);
}

export async function createBank(req: Request, env: Env) {
  const body = await req.json();
  const parsed = createBankSchema.safeParse(body);

  if (!parsed.success) {
    return json({ error: parsed.error.format() }, 400);
  }

  const { name } = parsed.data;
  const user = (req as AuthenticatedRequest).user;
  if (!user) return json({ error: "Unauthorized" }, 401);

  const result = await env.DB.prepare(
    "INSERT INTO banks (name, user_id, email) VALUES (?, ?, ?)"
  )
    .bind(name, user.sub, user.email ?? null)
    .run();

  // Invalidate Cache
  await env.KV.delete(`banks:${user.sub}`);

  return json({ id: result.meta.last_row_id, name }, 201);
}
