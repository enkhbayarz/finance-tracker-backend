import { Env } from "./types";
import { Router } from "./router";
import { cors, json } from "./utils/response";
import { getBanks, createBank } from "./handlers/banks";
import { getAccounts, createAccount, updateAccount } from "./handlers/accounts";
import { getCategories, createCategory, updateCategory } from "./handlers/categories";
import { getTransactions, getTransaction, createTransaction, updateTransaction } from "./handlers/transactions";
import { getGoals, getActiveGoal, createGoal, updateGoal } from "./handlers/goals";
import { getMonthlyReport, getCategoryReport, getTrendsReport } from "./handlers/reports";
import { authenticate } from "./middleware/auth";
import { AuthenticatedRequest } from "./types";

const router = new Router();

// Banks
router.get("/api/banks", getBanks);
router.post("/api/banks", createBank);

// Accounts
router.get("/api/accounts", getAccounts);
router.post("/api/accounts", createAccount);
router.put("/api/accounts/:id", updateAccount);

// Categories
router.get("/api/categories", getCategories);
router.post("/api/categories", createCategory);
router.put("/api/categories/:id", updateCategory);

// Transactions
router.get("/api/transactions", getTransactions);
router.get("/api/transactions/:id", getTransaction);
router.post("/api/transactions", createTransaction);
router.put("/api/transactions/:id", updateTransaction);

// Goals
router.get("/api/goals", getGoals);
router.get("/api/goals/active", getActiveGoal);
router.post("/api/goals", createGoal);
router.put("/api/goals/:id", updateGoal);

// Reports
router.get("/api/reports/monthly", getMonthlyReport);
router.get("/api/reports/category", getCategoryReport);
router.get("/api/reports/trends", getTrendsReport);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") return cors();

    try {
      const user = authenticate(request);
      (request as AuthenticatedRequest).user = user;
      return await router.handle(request as AuthenticatedRequest, env);
    } catch (e) {
      if (e instanceof Error) { // AppError extends Error
        // Ideally we return 401, but router.handle might wrap generic errors.
        // Since authenticate throws AppError with status, we should return that.
        return json({ error: e.message }, (e as any).statusCode || 500);
      }
      return json({ error: "Internal Server Error" }, 500);
    }
  },
};
