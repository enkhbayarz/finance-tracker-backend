export interface Env {
    DB: D1Database;
    KV: KVNamespace;
}

export interface AuthenticatedRequest extends Request {
    user?: {
        sub: string;
        email?: string;
    };
}
