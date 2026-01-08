import { Env } from "../types";
import { json } from "../utils/response";

export async function getMonthlyReport(req: Request, env: Env) {
    const url = new URL(req.url);
    const month =
        url.searchParams.get("month") || new Date().toISOString().slice(0, 7);

    const user = (req as any).user;
    const { results } = await env.DB.prepare(
        `
    SELECT category, SUM(amount) as total, COUNT(*) as count
    FROM transactions 
    WHERE date LIKE ? || '%' AND user_id = ?
    GROUP BY category
    ORDER BY total DESC
  `
    )
        .bind(month, user.sub)
        .all();
    return json(results);
}

export async function getCategoryReport(req: Request, env: Env) {
    const user = (req as any).user;
    const { results } = await env.DB.prepare(
        `
    SELECT category, SUM(amount) as total, COUNT(*) as count
    FROM transactions 
    WHERE user_id = ?
    GROUP BY category
    ORDER BY total DESC
  `
    ).bind(user.sub).all();
    return json(results);
}

export async function getTrendsReport(req: Request, env: Env) {
    const user = (req as any).user;
    const { results } = await env.DB.prepare(
        `
    SELECT strftime('%Y-%m', date) as month, SUM(amount) as total, COUNT(*) as count
    FROM transactions 
    WHERE user_id = ?
    GROUP BY strftime('%Y-%m', date)
    ORDER BY month DESC
    LIMIT 12
  `
    ).bind(user.sub).all();
    return json(results);
}
