import { Env } from "../types";
import { json } from "../utils/response";
import { createAccountSchema, updateAccountSchema } from "../schemas/accounts";

export async function getAccounts(req: Request, env: Env) {
    const user = (req as any).user;
    const { results } = await env.DB.prepare(
        `
    SELECT a.*, b.name as bank_name 
    FROM accounts a 
    LEFT JOIN banks b ON a.bank_id = b.id 
    WHERE a.user_id = ?
    ORDER BY a.name
  `
    ).bind(user.sub).all();
    return json(results);
}

export async function createAccount(req: Request, env: Env) {
    const body = await req.json();
    const parsed = createAccountSchema.safeParse(body);

    if (!parsed.success) {
        return json({ error: parsed.error.format() }, 400);
    }

    const { name, bank_id, account_type, balance, currency } = parsed.data;
    const user = (req as any).user;

    const result = await env.DB.prepare(
        "INSERT INTO accounts (name, bank_id, account_type, balance, currency, user_id, email) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
        .bind(name, bank_id, account_type, balance, currency, user.sub, user.email ?? null)
        .run();

    return json(
        {
            id: result.meta.last_row_id,
            name,
            bank_id,
            account_type,
            balance,
            currency,
        },
        201
    );
}

export async function updateAccount(req: Request, env: Env, params: Record<string, string>) {
    const body = await req.json();
    const parsed = updateAccountSchema.safeParse(body);

    if (!parsed.success) {
        return json({ error: parsed.error.format() }, 400);
    }

    const { balance } = parsed.data;
    const user = (req as any).user;
    await env.DB.prepare("UPDATE accounts SET balance = ? WHERE id = ? AND user_id = ?")
        .bind(balance, params.id, user.sub)
        .run();

    return json({ id: params.id, balance });
}
