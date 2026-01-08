import { Env } from "../types";
import { TransactionRepository } from "../repositories/transaction";
import { AccountRepository } from "../repositories/account";
import { AppError } from "../errors";

export class TransactionService {
  private transactionRepo: TransactionRepository;
  private accountRepo: AccountRepository;

  constructor(env: Env) {
    this.transactionRepo = new TransactionRepository(env);
    this.accountRepo = new AccountRepository(env);
  }

  async createTransaction(
    data: {
      amount: number;
      date: string;
      category: string;
      note?: string;
      bank: string;
      account: string;
      currency: string;
    },
    user: { sub: string; email?: string }
  ) {
    // 1. Find the account to update
    // Note: The transaction stores "account name", but accounts table uses ID and Name.
    // The current transaction handler receives account NAME string.
    // We need to find the account by name if possible, OR assuming the frontend sends account NAME.
    // However, the text says "account" in transaction is TEXT.
    // Ideally, transactions should link to account_id.
    // BUT checking schema.sql: transactions table has 'account TEXT'.
    // Accounts table has 'name TEXT'.
    // We need to look up the account by name to update its balance.

    // Warning: This logic relies on unique account names which might not be guaranteed by schema?
    // Schema says: banks name is unique. Accounts name is NOT unique globally, but arguably unique per bank?
    // Let's check schema again. `CREATE TABLE IF NOT EXISTS accounts ... name TEXT NOT NULL ...` - no unique constraint.
    // This is a data model flaw, but for now we will try to find the account by name.

    // Wait, the transaction request payload has "account" (string).
    // And "bank" (string).

    // Let's implement a helper in AccountRepo to find by name and bank (if possible) or just name.
    // For now, I'll assume we look up by name. If multiple, we might have issues.
    // Ideally user should refactor transactions to use account_id.

    // LET'S STICK TO THE PLAN: Update balance.
    // Since we don't have account_id in transaction, we have to search.

    const account = await this.accountRepo.getByName(data.account, user.sub);

    if (!account) {
      // If account doesn't exist in accounts table, we can't update balance.
      // We'll proceed with creating transaction but warn or just skip balance update?
      // Better to throw error if we want strict consistency, but maybe user uses free text?
      // Let's assume strictness for "Clean Code".
      throw new AppError(`Account '${data.account}' not found`, 404);
    }

    // 2. Create Transaction
    const result = await this.transactionRepo.create({
      ...data,
      user_id: user.sub,
      email: user.email,
    });

    // 3. Update Balance
    // If it's an expense (assuming positive amount means inflow? No usually transaction amount sign matters)
    // The current schema doesn't specify type. Usually:
    // Income = Positive, Expense = Negative?
    // OR Category determines it?
    // Looking at seed/schema, it's just 'amount'.
    // Let's assume the amount passed IS the delta.

    const newBalance = account.balance + data.amount;
    await this.accountRepo.updateBalance(account.id, newBalance, user.sub);

    return result;
  }
}
