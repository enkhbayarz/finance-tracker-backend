import { Env } from "../types";
import { json } from "../utils/response";
import { createTransactionSchema, updateTransactionSchema } from "../schemas/transactions";
import { TransactionService } from "../services/transaction";
import { TransactionRepository } from "../repositories/transaction";
import { AppError } from "../errors";

export async function getTransactions(req: Request, env: Env) {
    const user = (req as any).user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    const filters = {
        category: url.searchParams.get("category") || undefined,
        bank: url.searchParams.get("bank") || undefined,
        account: url.searchParams.get("account") || undefined,
        startDate: url.searchParams.get("startDate") || undefined,
        endDate: url.searchParams.get("endDate") || undefined,
    };

    const repo = new TransactionRepository(env);

    try {
        const result = await repo.findAll(user.sub, filters, page, limit);
        return json(result);
    } catch (e) {
        return json({ error: "Failed to fetch transactions" }, 500);
    }
}

export async function getTransaction(req: Request, env: Env, params: Record<string, string>) {
    const user = (req as any).user;
    const result = await env.DB.prepare("SELECT * FROM transactions WHERE id = ? AND user_id = ?")
        .bind(params.id, user.sub)
        .first();
    return result ? json(result) : json({ error: "Not found" }, 404);
}

export async function createTransaction(req: Request, env: Env) {
    const user = (req as any).user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const parsed = createTransactionSchema.safeParse(body);

    if (!parsed.success) {
        return json({ error: parsed.error.format() }, 400);
    }

    const service = new TransactionService(env);

    try {
        const result = await service.createTransaction(parsed.data, user);

        return json(
            {
                id: result.meta.last_row_id,
                ...parsed.data
            },
            201
        );
    } catch (e) {
        if (e instanceof AppError) {
            return json({ error: e.message }, e.statusCode);
        }
        return json({ error: "Internal Server Error" }, 500);
    }
}

export async function updateTransaction(req: Request, env: Env, params: Record<string, string>) {
    const body = await req.json();
    const parsed = updateTransactionSchema.safeParse(body);

    if (!parsed.success) {
        return json({ error: parsed.error.format() }, 400);
    }

    const { amount, date, category, note, bank, account, currency } = parsed.data;
    const user = (req as any).user;

    await env.DB.prepare(
        `
    UPDATE transactions SET 
      amount = COALESCE(?, amount), date = COALESCE(?, date), category = COALESCE(?, category),
      note = COALESCE(?, note), bank = COALESCE(?, bank), account = COALESCE(?, account),
      currency = COALESCE(?, currency), updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `
    )
        .bind(
            amount ?? null,
            date ?? null,
            category ?? null,
            note ?? null,
            bank ?? null,
            account ?? null,
            currency ?? null,
            params.id,
            user.sub
        )
        .run();

    return json({
        id: params.id,
        amount,
        date,
        category,
        note,
        bank,
        account,
        currency,
    });
}
