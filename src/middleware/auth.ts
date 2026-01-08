import { AppError } from "../errors";

export interface User {
    sub: string;
    email?: string;
}

export function authenticate(request: Request): User {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError("Unauthorized: Missing or invalid token", 401);
    }

    const token = authHeader.split(" ")[1];
    try {
        // Simple JWT decoding (payload is segment 1)
        const parts = token.split(".");
        if (parts.length !== 3) {
            throw new Error("Invalid token format");
        }

        const payload = JSON.parse(atob(parts[1]));

        // Validate Issuer
        if (!payload.iss || !payload.iss.includes("myjfdmxfpngtibdcdnps")) {
            throw new AppError("Unauthorized: Invalid issuer", 401);
        }

        // Return User Info
        return {
            sub: payload.sub,
            email: payload.email,
        };
    } catch (e) {
        if (e instanceof AppError) throw e;
        throw new AppError("Unauthorized: Invalid token", 401);
    }
}
