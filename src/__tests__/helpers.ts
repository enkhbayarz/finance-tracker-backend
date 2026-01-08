/**
 * Create a mock JWT token for testing
 */
export function createTestToken(payload: {
  sub: string;
  email?: string;
}): string {
  const header = { alg: "HS256", typ: "JWT" };
  const fullPayload = {
    ...payload,
    iss: "https://myjfdmxfpngtibdcdnps.supabase.co/auth/v1",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(fullPayload));
  const signature = "test-signature";

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Create authorization headers for test requests
 */
export function authHeaders(userId: string, email?: string): HeadersInit {
  return {
    Authorization: `Bearer ${createTestToken({ sub: userId, email })}`,
    "Content-Type": "application/json",
  };
}

/**
 * Test user data
 */
export const TEST_USER = {
  id: "test-user-123",
  email: "test@example.com",
};
