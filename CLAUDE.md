# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A multi-tenant Finance Tracker API built as a Cloudflare Worker. Uses TypeScript, D1 (SQLite), and Workers KV for caching.

## Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Start local development server (port 8787)
pnpm run dev

# Deploy to Cloudflare Workers
pnpm run deploy

# Database setup (local)
pnpm run db:init     # Create tables
pnpm run db:seed     # Load initial data

# Database setup (remote/production)
pnpm run db:init:remote
pnpm run db:seed:remote
pnpm run db:drop:remote  # Drop all tables (destructive)

# Linting and formatting
pnpm run lint            # Run ESLint
pnpm run lint:fix        # Run ESLint with auto-fix
pnpm run format          # Format code with Prettier
pnpm run format:check    # Check formatting without writing
```

## Architecture

The codebase follows a layered architecture:

```
Request → Router → Middleware (Auth) → Handler → Service → Repository → D1
```

### Layers

1. **Router** (`src/router.ts`) - Custom regex-based HTTP router with path parameter extraction (`:id` syntax)

2. **Middleware** (`src/middleware/auth.ts`) - JWT authentication using Supabase tokens. Validates issuer and attaches user to request.

3. **Handlers** (`src/handlers/`) - HTTP request/response orchestration. Parse body, validate with Zod schemas, delegate to services/repositories.

4. **Services** (`src/services/`) - Business logic. Currently only `transaction.ts` exists; other handlers bypass this layer.

5. **Repositories** (`src/repositories/`) - Data access via D1 prepared statements. All queries include `user_id` for multi-tenancy.

6. **Schemas** (`src/schemas/`) - Zod validation schemas for request bodies.

### Key Design Patterns

- **Multi-tenancy**: All database queries filter by `user_id` extracted from JWT
- **Caching**: Banks and Categories use Workers KV with 1-hour TTL (see handlers)
- **CORS**: Permissive headers (Origin: *) handled in `src/utils/response.ts`
- **Errors**: Custom `AppError` class in `src/errors/index.ts` with HTTP status codes

### Environment Bindings

Defined in `wrangler.toml` and typed in `src/types.ts`:
- `DB` - D1 database binding
- `KV` - Workers KV namespace for caching
- `SUPABASE_JWT_SECRET` - Secret for JWT verification

## Database

Schema defined in `schema.sql` with 5 tables: banks, accounts, categories, transactions, goals. All include `user_id` and `email` columns for tenant isolation.
