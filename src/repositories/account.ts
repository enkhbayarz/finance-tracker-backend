import { BaseRepository } from "./base";
import { AppError } from "../errors";

export interface Account {
    id: number;
    name: string;
    bank_id: number;
    account_type: string;
    balance: number;
    currency: string;
    created_at: string;
}

export class AccountRepository extends BaseRepository<Account> {
    async getById(id: number, userId: string): Promise<Account | null> {
        return this.env.DB.prepare("SELECT * FROM accounts WHERE id = ? AND user_id = ?").bind(id, userId).first<Account>();
    }

    async updateBalance(id: number, balance: number, userId: string): Promise<void> {
        await this.env.DB.prepare("UPDATE accounts SET balance = ? WHERE id = ? AND user_id = ?")
            .bind(balance, id, userId)
            .run();
    }

    async getByName(name: string, userId: string): Promise<Account | null> {
        return this.env.DB.prepare("SELECT * FROM accounts WHERE name = ? AND user_id = ?").bind(name, userId).first<Account>();
    }

    // We can migrate other queries here too, but prioritized balance logic
}
