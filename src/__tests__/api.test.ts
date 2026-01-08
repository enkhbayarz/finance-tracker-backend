import { env, SELF } from "cloudflare:test";
import { describe, it, expect, beforeAll } from "vitest";
import { authHeaders, TEST_USER } from "./helpers";

// Initialize database schema before tests
beforeAll(async () => {
  await env.DB.batch([
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS banks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        user_id TEXT NOT NULL,
        email TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, user_id)
      )
    `),
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        bank_id INTEGER,
        account_type TEXT,
        balance REAL DEFAULT 0,
        currency TEXT DEFAULT '₮',
        user_id TEXT NOT NULL,
        email TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bank_id) REFERENCES banks(id)
      )
    `),
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        budget_amount REAL DEFAULT 0,
        user_id TEXT NOT NULL,
        email TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, user_id)
      )
    `),
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        note TEXT,
        bank TEXT NOT NULL,
        account TEXT NOT NULL,
        currency TEXT DEFAULT '₮',
        user_id TEXT NOT NULL,
        email TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `),
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        target_amount REAL NOT NULL,
        current_amount REAL DEFAULT 0,
        currency TEXT DEFAULT '₮',
        is_active INTEGER DEFAULT 1,
        user_id TEXT NOT NULL,
        email TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `),
  ]);
});

describe("Authentication", () => {
  it("returns 401 for requests without authorization header", async () => {
    const response = await SELF.fetch("https://example.com/api/banks");
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data).toHaveProperty("error");
  });

  it("returns 401 for requests with invalid token", async () => {
    const response = await SELF.fetch("https://example.com/api/banks", {
      headers: {
        Authorization: "Bearer invalid-token",
      },
    });
    expect(response.status).toBe(401);
  });

  it("handles OPTIONS requests for CORS", async () => {
    const response = await SELF.fetch("https://example.com/api/banks", {
      method: "OPTIONS",
    });
    expect(response.status).toBe(200);
  });
});

describe("Banks API", () => {
  it("GET /api/banks returns empty array initially", async () => {
    const response = await SELF.fetch("https://example.com/api/banks", {
      headers: authHeaders(TEST_USER.id, TEST_USER.email),
    });
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("POST /api/banks creates a new bank", async () => {
    const response = await SELF.fetch("https://example.com/api/banks", {
      method: "POST",
      headers: authHeaders(TEST_USER.id, TEST_USER.email),
      body: JSON.stringify({ name: "Test Bank" }),
    });
    expect(response.status).toBe(201);

    const data = (await response.json()) as { id: number; name: string };
    expect(data.name).toBe("Test Bank");
    expect(data.id).toBeDefined();
  });

  it("POST /api/banks returns 400 for invalid data", async () => {
    const response = await SELF.fetch("https://example.com/api/banks", {
      method: "POST",
      headers: authHeaders(TEST_USER.id, TEST_USER.email),
      body: JSON.stringify({}),
    });
    expect(response.status).toBe(400);
  });
});

describe("Accounts API", () => {
  it("GET /api/accounts returns accounts list", async () => {
    const response = await SELF.fetch("https://example.com/api/accounts", {
      headers: authHeaders(TEST_USER.id, TEST_USER.email),
    });
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("POST /api/accounts creates a new account", async () => {
    // First create a bank
    const bankResponse = await SELF.fetch("https://example.com/api/banks", {
      method: "POST",
      headers: authHeaders(`${TEST_USER.id}-accounts`, TEST_USER.email),
      body: JSON.stringify({ name: "Account Test Bank" }),
    });
    const bank = (await bankResponse.json()) as { id: number };

    // Then create an account
    const response = await SELF.fetch("https://example.com/api/accounts", {
      method: "POST",
      headers: authHeaders(`${TEST_USER.id}-accounts`, TEST_USER.email),
      body: JSON.stringify({
        name: "Checking Account",
        bank_id: bank.id,
        account_type: "checking",
        balance: 1000,
        currency: "₮",
      }),
    });
    expect(response.status).toBe(201);

    const data = (await response.json()) as { id: number; name: string };
    expect(data.name).toBe("Checking Account");
  });
});

describe("Categories API", () => {
  it("GET /api/categories returns categories list", async () => {
    const response = await SELF.fetch("https://example.com/api/categories", {
      headers: authHeaders(TEST_USER.id, TEST_USER.email),
    });
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("POST /api/categories creates a new category", async () => {
    const response = await SELF.fetch("https://example.com/api/categories", {
      method: "POST",
      headers: authHeaders(TEST_USER.id, TEST_USER.email),
      body: JSON.stringify({
        name: "Food",
        icon: "🍔",
        color: "#FF5733",
        budget_amount: 500,
      }),
    });
    expect(response.status).toBe(201);

    const data = (await response.json()) as { id: number; name: string };
    expect(data.name).toBe("Food");
  });
});

describe("Goals API", () => {
  it("GET /api/goals returns goals list", async () => {
    const response = await SELF.fetch("https://example.com/api/goals", {
      headers: authHeaders(TEST_USER.id, TEST_USER.email),
    });
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("POST /api/goals creates a new goal", async () => {
    const response = await SELF.fetch("https://example.com/api/goals", {
      method: "POST",
      headers: authHeaders(TEST_USER.id, TEST_USER.email),
      body: JSON.stringify({
        name: "Emergency Fund",
        target_amount: 10000,
        current_amount: 1000,
        currency: "₮",
      }),
    });
    expect(response.status).toBe(201);

    const data = (await response.json()) as { id: number; name: string };
    expect(data.name).toBe("Emergency Fund");
  });

  it("GET /api/goals/active returns 404 when no active goal", async () => {
    const response = await SELF.fetch("https://example.com/api/goals/active", {
      headers: authHeaders(`${TEST_USER.id}-no-goals`, TEST_USER.email),
    });
    expect(response.status).toBe(404);
  });
});

describe("Transactions API", () => {
  it("GET /api/transactions returns paginated transactions", async () => {
    const response = await SELF.fetch(
      "https://example.com/api/transactions?page=1&limit=10",
      {
        headers: authHeaders(TEST_USER.id, TEST_USER.email),
      }
    );
    expect(response.status).toBe(200);

    const data = (await response.json()) as {
      data: unknown[];
      meta: { page: number };
    };
    expect(data).toHaveProperty("data");
    expect(data).toHaveProperty("meta");
  });

  it("GET /api/transactions/:id returns 404 for non-existent transaction", async () => {
    const response = await SELF.fetch(
      "https://example.com/api/transactions/99999",
      {
        headers: authHeaders(TEST_USER.id, TEST_USER.email),
      }
    );
    expect(response.status).toBe(404);
  });
});

describe("Reports API", () => {
  it("GET /api/reports/monthly returns monthly report", async () => {
    const response = await SELF.fetch(
      "https://example.com/api/reports/monthly",
      {
        headers: authHeaders(TEST_USER.id, TEST_USER.email),
      }
    );
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("GET /api/reports/category returns category report", async () => {
    const response = await SELF.fetch(
      "https://example.com/api/reports/category",
      {
        headers: authHeaders(TEST_USER.id, TEST_USER.email),
      }
    );
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("GET /api/reports/trends returns trends report", async () => {
    const response = await SELF.fetch(
      "https://example.com/api/reports/trends",
      {
        headers: authHeaders(TEST_USER.id, TEST_USER.email),
      }
    );
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });
});
