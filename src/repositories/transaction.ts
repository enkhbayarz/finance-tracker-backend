import { BaseRepository } from "./base";

export interface Transaction {
  id: number;
  amount: number;
  date: string;
  category: string;
  note?: string;
  bank: string;
  account: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionFilters {
  category?: string;
  bank?: string;
  account?: string;
  startDate?: string;
  endDate?: string;
}

export class TransactionRepository extends BaseRepository<Transaction> {
  async findAll(
    userId: string,
    filters: TransactionFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: Transaction[];
    meta: { page: number; limit: number; total: number; total_pages: number };
  }> {
    const offset = (page - 1) * limit;
    let query = "SELECT * FROM transactions WHERE user_id = ?";
    let countQuery =
      "SELECT COUNT(*) as total FROM transactions WHERE user_id = ?";
    const bindings: (string | number)[] = [userId];

    // Apply filters
    if (filters.category) {
      query += " AND category = ?";
      countQuery += " AND category = ?";
      bindings.push(filters.category);
    }
    if (filters.bank) {
      query += " AND bank = ?";
      countQuery += " AND bank = ?";
      bindings.push(filters.bank);
    }
    if (filters.account) {
      query += " AND account = ?";
      countQuery += " AND account = ?";
      bindings.push(filters.account);
    }
    if (filters.startDate) {
      query += " AND date >= ?";
      countQuery += " AND date >= ?";
      bindings.push(filters.startDate);
    }
    if (filters.endDate) {
      query += " AND date <= ?";
      countQuery += " AND date <= ?";
      bindings.push(filters.endDate);
    }

    // Get Total Count
    const totalResult = await this.env.DB.prepare(countQuery)
      .bind(...bindings)
      .first<{ total: number }>();
    const total = totalResult?.total || 0;
    const total_pages = Math.ceil(total / limit);

    // Get Data
    query += " ORDER BY date DESC, id DESC LIMIT ? OFFSET ?";
    const dataBindings = [...bindings, limit, offset];

    const { results } = await this.env.DB.prepare(query)
      .bind(...dataBindings)
      .all<Transaction>();

    return {
      data: results,
      meta: {
        page,
        limit,
        total,
        total_pages,
      },
    };
  }

  async create(
    data: Omit<Transaction, "id" | "created_at" | "updated_at"> & {
      user_id: string;
      email?: string;
    }
  ): Promise<D1Result> {
    const {
      amount,
      date,
      category,
      note,
      bank,
      account,
      currency,
      user_id,
      email,
    } = data;
    return this.env.DB.prepare(
      "INSERT INTO transactions (amount, date, category, note, bank, account, currency, user_id, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
      .bind(
        amount,
        date,
        category,
        note ?? null,
        bank,
        account,
        currency,
        user_id,
        email ?? null
      )
      .run();
  }

  async getById(id: number, userId: string): Promise<Transaction | null> {
    return this.env.DB.prepare(
      "SELECT * FROM transactions WHERE id = ? AND user_id = ?"
    )
      .bind(id, userId)
      .first<Transaction>();
  }
}
