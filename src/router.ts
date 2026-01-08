import { Env } from "./types";
import { json } from "./utils/response";

export type Handler = (
  request: Request,
  env: Env,
  params: Record<string, string>
) => Promise<Response>;

interface Route {
  method: string;
  pattern: RegExp;
  handler: Handler;
}

export class Router {
  private routes: Route[] = [];

  constructor() {}

  private add(method: string, path: string, handler: Handler) {
    const pattern = new RegExp(`^${path.replace(/:(\w+)/g, "(?<$1>[^/]+)")}$`);
    this.routes.push({ method, pattern, handler });
  }

  get(path: string, handler: Handler) {
    this.add("GET", path, handler);
  }

  post(path: string, handler: Handler) {
    this.add("POST", path, handler);
  }

  put(path: string, handler: Handler) {
    this.add("PUT", path, handler);
  }

  async handle(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    for (const { method, pattern, handler } of this.routes) {
      if (request.method === method) {
        const match = path.match(pattern);
        if (match) {
          try {
            return await handler(request, env, match.groups ?? {});
          } catch (e) {
            console.error(e);
            if (e instanceof Error) {
              return json({ error: e.message }, 500);
            }
            return json({ error: "Internal Server Error" }, 500);
          }
        }
      }
    }

    return json({ error: "Not found" }, 404);
  }
}
