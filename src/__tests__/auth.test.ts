import { describe, it, expect } from "vitest";
import { authenticate } from "../middleware/auth";
import { AppError } from "../errors";
import { createTestToken } from "./helpers";

describe("authenticate", () => {
  it("throws error when Authorization header is missing", () => {
    const request = new Request("https://example.com/api/test");

    expect(() => authenticate(request)).toThrow(AppError);
    expect(() => authenticate(request)).toThrow(
      "Unauthorized: Missing or invalid token"
    );
  });

  it("throws error when Authorization header does not start with Bearer", () => {
    const request = new Request("https://example.com/api/test", {
      headers: {
        Authorization: "Basic some-token",
      },
    });

    expect(() => authenticate(request)).toThrow(AppError);
  });

  it("throws error for invalid token format", () => {
    const request = new Request("https://example.com/api/test", {
      headers: {
        Authorization: "Bearer not-a-jwt",
      },
    });

    expect(() => authenticate(request)).toThrow(AppError);
    expect(() => authenticate(request)).toThrow("Unauthorized: Invalid token");
  });

  it("throws error for token with invalid issuer", () => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(
      JSON.stringify({
        sub: "user-123",
        iss: "https://wrong-issuer.com",
      })
    );
    const token = `${header}.${payload}.signature`;

    const request = new Request("https://example.com/api/test", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(() => authenticate(request)).toThrow(AppError);
    expect(() => authenticate(request)).toThrow("Unauthorized: Invalid issuer");
  });

  it("returns user data for valid token", () => {
    const token = createTestToken({
      sub: "user-123",
      email: "test@example.com",
    });

    const request = new Request("https://example.com/api/test", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const user = authenticate(request);
    expect(user.sub).toBe("user-123");
    expect(user.email).toBe("test@example.com");
  });

  it("returns user data without email when not provided", () => {
    const token = createTestToken({
      sub: "user-456",
    });

    const request = new Request("https://example.com/api/test", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const user = authenticate(request);
    expect(user.sub).toBe("user-456");
    expect(user.email).toBeUndefined();
  });
});
