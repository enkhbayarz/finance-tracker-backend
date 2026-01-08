# Finance Tracker API

A secure, multi-tenant Finance Tracker API built with **Cloudflare Workers**, **D1 SQLite**, and **Workers KV**.

## Features

-   **Authentication**: JWT-based auth via Supabase (Bearer Token checking `iss`, `sub`, `email`).
-   **Multi-tenancy**: Strictly isolated data per user (`user_id`).
-   **Validation**: Validation via `zod`.
-   **Optimization**:
    -   **Caching**: Workers KV caching for `Banks` and `Categories`.
    -   **Pagination**: Pagination for `Transactions` list.
-   **Architecture**: Clean Architecture (Router -> Handlers -> Services -> Repositories).

## Setup

### Prerequisites

-   Node.js (v18+)
-   Cloudflare Wrangler CLI (`npm i -g wrangler`)
-   Supabase Project (for JWT generation)

### Installation

```bash
npm install
```

### Configuration

1.  **D1 Database**:
    ```bash
    npx wrangler d1 create finance_tracker_db
    # Update `database_id` in wrangler.toml
    ```

2.  **Workers KV**:
    ```bash
    npx wrangler kv:namespace create FINANCE_CACHE
    # Update `id` under [[kv_namespaces]] in wrangler.toml
    ```

### Database Initialization

**Local Development:**
```bash
# Create tables
npm run db:init

# Seed initial data (optional)
npm run db:seed
```

**Remote Production:**
```bash
# Create tables remotely
npm run db:init:remote

# Seed data remotely
npm run db:seed:remote
```

### Running Locally

```bash
npm run dev
```

The API will be available at `http://localhost:8787`.

## Authentication

All API endpoints (except `OPTIONS`) require a generic Supabase-compatible JWT token in the Authorization header.

```http
Authorization: Bearer <YOUR_JWT_TOKEN>
```
*Token checks: `iss` must include `myjfdmxfpngtibdcdnps`.*

## API Endpoints

See [API_DOCS.md](./API_DOCS.md) for detailed Request/Response examples.

### Banks
-   `GET /api/banks` (Cached)
-   `POST /api/banks`

### Accounts
-   `GET /api/accounts`
-   `POST /api/accounts`
-   `PUT /api/accounts/:id`

### Categories
-   `GET /api/categories` (Cached)
-   `POST /api/categories`
-   `PUT /api/categories/:id`

### Transactions
-   `GET /api/transactions` (Paginated)
    -   Query: `page`, `limit`, `category`, `bank`, `account`, `startDate`, `endDate`
-   `GET /api/transactions/:id`
-   `POST /api/transactions`
-   `PUT /api/transactions/:id`
-   `DELETE /api/transactions/:id`

### Goals
-   `GET /api/goals`
-   `GET /api/goals/active`
-   `POST /api/goals`
-   `PUT /api/goals/:id`

### Reports
-   `GET /api/reports/monthly`
-   `GET /api/reports/category`
-   `GET /api/reports/trends`
