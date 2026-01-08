import { describe, it, expect } from "vitest";
import { Router } from "../router";
import { Env } from "../types";

describe("Router", () => {
  it("matches simple routes", async () => {
    const router = new Router();
    let called = false;

    router.get("/api/test", async () => {
      called = true;
      return new Response("OK");
    });

    const request = new Request("https://example.com/api/test", {
      method: "GET",
    });

    const response = await router.handle(request, {} as Env);
    expect(called).toBe(true);
    expect(response.status).toBe(200);
  });

  it("matches routes with parameters", async () => {
    const router = new Router();
    let capturedParams: Record<string, string> = {};

    router.get("/api/items/:id", async (_req, _env, params) => {
      capturedParams = params;
      return new Response("OK");
    });

    const request = new Request("https://example.com/api/items/123", {
      method: "GET",
    });

    await router.handle(request, {} as Env);
    expect(capturedParams.id).toBe("123");
  });

  it("matches POST routes", async () => {
    const router = new Router();
    let method = "";

    router.post("/api/items", async (req) => {
      method = req.method;
      return new Response("Created", { status: 201 });
    });

    const request = new Request("https://example.com/api/items", {
      method: "POST",
    });

    const response = await router.handle(request, {} as Env);
    expect(method).toBe("POST");
    expect(response.status).toBe(201);
  });

  it("matches PUT routes", async () => {
    const router = new Router();
    let capturedParams: Record<string, string> = {};

    router.put("/api/items/:id", async (_req, _env, params) => {
      capturedParams = params;
      return new Response("Updated");
    });

    const request = new Request("https://example.com/api/items/456", {
      method: "PUT",
    });

    await router.handle(request, {} as Env);
    expect(capturedParams.id).toBe("456");
  });

  it("returns 404 for unmatched routes", async () => {
    const router = new Router();

    const request = new Request("https://example.com/api/unknown", {
      method: "GET",
    });

    const response = await router.handle(request, {} as Env);
    expect(response.status).toBe(404);
  });

  it("returns 404 for wrong method", async () => {
    const router = new Router();

    router.get("/api/test", async () => {
      return new Response("OK");
    });

    const request = new Request("https://example.com/api/test", {
      method: "POST",
    });

    const response = await router.handle(request, {} as Env);
    expect(response.status).toBe(404);
  });
});
